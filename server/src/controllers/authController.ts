import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

// Generate JWT token
const generateToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  } as jwt.SignOptions);
};

// Generate refresh token
const generateRefreshToken = (payload: object): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  } as jwt.SignOptions);
};

// Set token cookie
const setTokenCookie = (res: Response, token: string): void => {
  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE!) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res.cookie('token', token, options);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'User already exists with this email',
      },
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationToken,
      emailVerificationExpire,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      template: 'emailVerification',
      data: {
        name: user.firstName,
        verificationUrl,
      },
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
  }

  // Generate tokens
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  setTokenCookie(res, token);

  return res.status(201).json({
    success: true,
    data: {
      user,
      token,
      refreshToken,
    },
    message: 'User registered successfully. Please check your email to verify your account.',
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
      },
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
      },
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  setTokenCookie(res, token);

  const { password: _, ...userWithoutPassword } = user;

  return res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
      refreshToken,
    },
    message: 'Login successful',
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;

  // Remove refresh token from database
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
        userId: req.user!.id,
      },
    });
  }

  // Clear cookie
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
  });

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Refresh token is required',
      },
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
    };

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!storedToken || !storedToken.user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
        },
      });
    }

    // Generate new tokens
    const newToken = generateToken({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });
    const newRefreshToken = generateRefreshToken({ id: storedToken.user.id });

    // Remove old refresh token and save new one
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    setTokenCookie(res, newToken);

    return res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid refresh token',
      },
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found with this email',
      },
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpire,
    },
  });

  // Send reset email
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      template: 'passwordReset',
      data: {
        name: user.firstName,
        resetUrl,
      },
    });

    return res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    // Remove reset token if email fails
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    logger.error('Failed to send password reset email:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send password reset email',
      },
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpire: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid or expired reset token',
      },
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password and remove reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
  });

  // Remove all refresh tokens for this user
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  return res.json({
    success: true,
    message: 'Password reset successful',
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpire: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid or expired verification token',
      },
    });
  }

  // Update user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpire: null,
    },
  });

  return res.json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email is already verified',
      },
    });
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken,
      emailVerificationExpire,
    },
  });

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      template: 'emailVerification',
      data: {
        name: user.firstName,
        verificationUrl,
      },
    });

    return res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send verification email',
      },
    });
  }
});