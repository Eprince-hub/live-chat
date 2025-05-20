import { Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth } from '../middleware/auth';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderBody {
  sellerId: string;
  items: OrderItem[];
}

const router = Router();

// Get all orders for the current user (as buyer)
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      throw new Error('User not found');
    }

    const orders = await prisma.order.findMany({
      where: {
        buyerId: req.user.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      throw new Error('User not found');
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Check if user is either the buyer or seller
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this order',
        },
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      throw new Error('User not found');
    }

    const { sellerId, items }: CreateOrderBody = req.body;

    // Start a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Check if all products exist and have enough inventory
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { inventory: true, price: true, sellerId: true },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.inventory < item.quantity) {
          throw new Error(`Not enough inventory for product ${item.productId}`);
        }

        if (product.sellerId !== sellerId) {
          throw new Error(
            `Product ${item.productId} does not belong to the specified seller`,
          );
        }
      }

      // Calculate total amount
      const totalAmount = await items.reduce(
        async (accPromise: Promise<number>, item: OrderItem) => {
          const acc = await accPromise;
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { price: true },
          });
          return acc + (product?.price || 0) * item.quantity;
        },
        Promise.resolve(0),
      );

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId: req.user.id,
          sellerId,
          status: 'pending',
          totalAmount,
          items: {
            create: items.map((item: OrderItem) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: 0, // Will be updated below
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update order items with correct prices and update product inventory
      for (const item of newOrder.items) {
        await tx.orderItem.update({
          where: { id: item.id },
          data: { price: item.product.price },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: error.message,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      throw new Error('User not found');
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: { sellerId: true, status: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Only seller can update order status
    if (order.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this order',
        },
      });
    }

    const { status } = req.body;

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      pending: ['paid', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot transition from ${order.status} to ${status}`,
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Cancel order
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      throw new Error('User not found');
    }

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    // Only buyer or seller can cancel the order
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this order',
        },
      });
    }

    // Can only cancel pending or paid orders
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Cannot cancel order in current status',
        },
      });
    }

    // Start a transaction to cancel order and restore inventory
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore product inventory
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      return tx.order.update({
        where: { id: req.params.id },
        data: { status: 'cancelled' },
        include: {
          buyer: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  images: true,
                },
              },
            },
          },
        },
      });
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

export default router;
