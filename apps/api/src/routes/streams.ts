import { Router } from 'express';
import { auth } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// Get all streams
router.get('/', async (req, res) => {
  try {
    const streams = await prisma.stream.findMany({
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: streams,
    });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Get stream by ID
router.get('/:id', async (req, res) => {
  try {
    const stream = await prisma.stream.findUnique({
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
        products: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            inventory: true,
          },
        },
      },
    });

    if (!stream) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STREAM_NOT_FOUND',
          message: 'Stream not found',
        },
      });
    }

    res.json({
      success: true,
      data: stream,
    });
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// Create stream
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not found');
    }

    const { title, description, thumbnailUrl, startTime, productIds } = req.body;

    const stream = await prisma.stream.create({
      data: {
        title,
        description,
        thumbnailUrl,
        startTime: new Date(startTime),
        sellerId: req.user.id,
        products: {
          connect: productIds?.map((id: string) => ({ id })) || [],
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
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: stream,
    });
  } catch (error) {
    console.error('Error creating stream:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PRODUCT_IDS',
            message: 'One or more product IDs are invalid',
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

// Update stream
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not found');
    }

    const stream = await prisma.stream.findUnique({
      where: { id: req.params.id },
      select: { sellerId: true },
    });

    if (!stream) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STREAM_NOT_FOUND',
          message: 'Stream not found',
        },
      });
    }

    // Check if user owns the stream
    if (stream.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this stream',
        },
      });
    }

    const { title, description, thumbnailUrl, status, productIds } = req.body;

    const updatedStream = await prisma.stream.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        thumbnailUrl,
        status,
        endTime: status === 'ended' ? new Date() : undefined,
        products: productIds
          ? {
              set: productIds.map((id: string) => ({ id })),
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
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedStream,
    });
  } catch (error) {
    console.error('Error updating stream:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PRODUCT_IDS',
            message: 'One or more product IDs are invalid',
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

// Delete stream
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User not found');
    }

    const stream = await prisma.stream.findUnique({
      where: { id: req.params.id },
      select: { sellerId: true },
    });

    if (!stream) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STREAM_NOT_FOUND',
          message: 'Stream not found',
        },
      });
    }

    // Check if user owns the stream
    if (stream.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this stream',
        },
      });
    }

    await prisma.stream.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      data: { message: 'Stream deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting stream:', error);
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