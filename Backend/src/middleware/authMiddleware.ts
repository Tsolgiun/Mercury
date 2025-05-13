import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { IUser } from '../models/userModel';
import { verifyToken } from '../utils/authUtils';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token and attaches the user to the request
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token is in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'null' || token === 'undefined') {
        res.status(401).json({
          success: false,
          message: 'Invalid token format',
        });
        return;
      }

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
        return;
      }

      // Get user from MongoDB using ID
      const user = await User.findById(decoded.id) as IUser;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Attach user and token to request
      req.user = user;
      req.token = token;

      next();
      return;
    } catch (error) {
      console.error('Error in auth middleware:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, authentication failed',
      });
      return;
    }
  }

  // No token provided
  res.status(401).json({
    success: false,
    message: 'Not authorized, no token',
  });
  return;
};

/**
 * Middleware to protect routes that require admin access
 * Must be used after the protect middleware
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin',
    });
    return;
  }
};

/**
 * Optional authentication middleware
 * Attaches the user to the request if a valid token is provided
 * but does not require authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token is in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'null' || token === 'undefined') {
        // Skip authentication for invalid tokens in optional auth
        console.log('Skipping optional auth due to invalid token format');
        next();
        return;
      }

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        // Skip authentication for invalid tokens in optional auth
        console.log('Skipping optional auth due to invalid token');
        next();
        return;
      }

      // Get user from MongoDB using ID
      const user = await User.findById(decoded.id) as IUser;

      if (user) {
        // Attach user and token to request
        req.user = user;
        req.token = token;
        console.log(`Optional auth successful for user: ${user._id}`);
      }
    } catch (error) {
      // Just log the error but don't return an error response
      console.error('Error in optional auth:', error);
      // Continue without authentication
    }
  }

  // Always proceed to the next middleware
  next();
};
