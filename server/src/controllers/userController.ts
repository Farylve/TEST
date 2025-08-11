import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  return res.json({
    success: true,
    data: { user },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { firstName, lastName, email } = req.body;
  const userId = req.user!.id;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is already taken',
        },
      });
    }
  }

  // Prepare update data
  const updateData: any = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (email !== undefined) {
    updateData.email = email;
    updateData.isEmailVerified = false; // Reset email verification if email changes
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json({
    success: true,
    data: { user: updatedUser },
    message: 'Profile updated successfully',
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Current password is incorrect',
      },
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  // Remove all refresh tokens for this user (force re-login)
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  // Delete all refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  // Soft delete user (set isActive to false)
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      email: `deleted_${Date.now()}_${userId}@deleted.com`, // Prevent email conflicts
    },
  });

  return res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const isActive = req.query.isActive as string;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (role) {
    where.role = role;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  return res.json({
    success: true,
    data: { user },
  });
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, email, role, isActive } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== existingUser.email) {
    const emailTaken = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (emailTaken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is already taken',
        },
      });
    }
  }

  // Prepare update data
  const updateData: any = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (email !== undefined) {
    updateData.email = email;
    if (email !== existingUser.email) {
      updateData.isEmailVerified = false; // Reset email verification if email changes
    }
  }
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  // If user is deactivated, remove all their refresh tokens
  if (isActive === false) {
    await prisma.refreshToken.deleteMany({
      where: { userId: id },
    });
  }

  return res.json({
    success: true,
    data: { user: updatedUser },
    message: 'User updated successfully',
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  // Delete all refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId: id },
  });

  // Soft delete user (set isActive to false)
  await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      email: `deleted_${Date.now()}_${id}@deleted.com`, // Prevent email conflicts
    },
  });

  logger.info(`User ${id} deleted by admin`);

  return res.json({
    success: true,
    message: 'User deleted successfully',
  });
});