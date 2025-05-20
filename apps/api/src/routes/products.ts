import { Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth } from '../middleware/auth';

const router = Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        streams: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        streams: {
          select: {
            id: true,
            title: true,
            status: true,
            startTime: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not found');
    }

    const {
      title,
      description,
      price,
      images,
      category,
      inventory,
      streamIds,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        images,
        category,
        inventory: parseInt(inventory),
        sellerId: req.user.id,
        streams: {
          connect: streamIds?.map((id: string) => ({ id })) || [],
        },
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
        streams: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STREAM_IDS',
            message: 'One or more stream IDs are invalid',
          },
        });
      }
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

// Update product
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not found');
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { sellerId: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    // Check if user owns the product
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this product',
        },
      });
    }

    const {
      title,
      description,
      price,
      images,
      category,
      inventory,
      streamIds,
    } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        images,
        category,
        inventory: inventory ? parseInt(inventory) : undefined,
        streams: streamIds
          ? {
              set: streamIds.map((id: string) => ({ id })),
            }
          : undefined,
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
        streams: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STREAM_IDS',
            message: 'One or more stream IDs are invalid',
          },
        });
      }
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

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not found');
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { sellerId: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    // Check if user owns the product
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this product',
        },
      });
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      data: { message: 'Product deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
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
