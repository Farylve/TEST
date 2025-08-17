import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { databaseService } from '../services/database';

interface PostQuery {
  page?: string;
  limit?: string;
  category?: string;
  tag?: string;
  search?: string;
}

/**
 * @route GET /api/posts
 * @desc Get all published posts with pagination and filtering
 * @access Public
 */
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const prisma = databaseService.getPrismaClient();
    if (!prisma) {
      res.status(503).json({
        success: false,
        message: 'Database service unavailable',
      });
      return;
    }

    const { page = '1', limit = '10', category, tag, search }: PostQuery = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where: any = {
      status: 'PUBLISHED',
    };

    // Add search filter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Add category filter
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Add tag filter
    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    // Get posts with relations
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.post.count({ where }),
    ]);

    // Transform the data to flatten categories and tags
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag),
      stats: {
        comments: post._count.comments,
        likes: post._count.likes,
      },
    }));

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        posts: transformedPosts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          category,
          tag,
          search,
        },
      },
    });

  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * @route GET /api/posts/id/:id
 * @desc Get a single post by ID
 * @access Public
 */
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const prisma = databaseService.getPrismaClient();
    if (!prisma) {
      res.status(503).json({
        success: false,
        message: 'Database service unavailable',
      });
      return;
    }

    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    // Transform the data
    const transformedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag),
      stats: {
        comments: post._count.comments,
        likes: post._count.likes,
      },
    };

    res.status(200).json({
      success: true,
      data: transformedPost,
    });

  } catch (error) {
    logger.error('Error fetching post by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * @route GET /api/posts/slug/:slug
 * @desc Get a single post by slug
 * @access Public
 */
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const prisma = databaseService.getPrismaClient();
    if (!prisma) {
      res.status(503).json({
        success: false,
        message: 'Database service unavailable',
      });
      return;
    }

    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    // Transform the data
    const transformedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      categories: post.categories.map(pc => pc.category),
      tags: post.tags.map(pt => pt.tag),
      stats: {
        comments: post._count.comments,
        likes: post._count.likes,
      },
    };

    res.status(200).json({
      success: true,
      data: transformedPost,
    });

  } catch (error) {
    logger.error('Error fetching post by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};