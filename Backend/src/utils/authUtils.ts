import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { IUser } from '../models/userModel';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

// Log JWT configuration (for debugging)
console.log('JWT Configuration:');
console.log('- JWT_SECRET length:', JWT_SECRET.length);
console.log('- JWT_EXPIRE:', JWT_EXPIRE);
console.log('- JWT_REFRESH_SECRET length:', JWT_REFRESH_SECRET.length);
console.log('- JWT_REFRESH_EXPIRE:', JWT_REFRESH_EXPIRE);

/**
 * Hash a password
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password
 * @returns Boolean indicating if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT tokens for authentication
 * @param userId - User ID
 * @returns Object containing access token and refresh token
 */
export const generateTokens = (userId: string) => {
  // Create access token
  const accessToken = jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE } as SignOptions
  );

  // Create refresh token
  const refreshToken = jwt.sign(
    { id: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE } as SignOptions
  );

  return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

/**
 * Verify refresh token
 * @param token - Refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    return decoded;
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
};

/**
 * Set JWT cookies in response
 * @param res - Express response object
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 */
export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

/**
 * Clear auth cookies
 * @param res - Express response object
 */
export const clearTokenCookies = (res: Response): void => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

/**
 * Create user response object (removes sensitive data)
 * @param user - User document
 * @returns User object without sensitive data
 */
export const createUserResponse = (user: IUser) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
};
