import { Request, Response } from 'express';
import { User } from '../models';
import { IUser } from '../models/userModel';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  createUserResponse,
} from '../utils/authUtils';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    console.log('Register request body:', {
      ...req.body,
      password: req.body.password ? '******' : undefined
    });
    
    const { name, email, username, password } = req.body;

    // Check if required fields are provided
    if (!name || !email || !username || !password) {
      console.log('Missing required fields:', {
        name: !name,
        email: !email,
        username: !username,
        password: !password
      });
      
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      console.log('User already exists:', {
        email: userExists.email === email,
        username: userExists.username === username
      });
      
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      isAdmin: false,
    }) as IUser;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();    // Return user data and tokens
    res.status(201).json({
      success: true,
      data: {
        user: createUserResponse(user),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      // Check if it's a MongoDB validation error
      if (error.name === 'ValidationError') {
        console.error('Validation error:', error);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.message,
        });
      }
      
      // Check if it's a MongoDB duplicate key error
      if (error.name === 'MongoError' && (error as any).code === 11000) {
        console.error('Duplicate key error:', error);
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists',
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An unknown error occurred',
      });
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email }) as IUser;    // If user doesn't exist
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // If password is incorrect
    if (!(await comparePassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data and tokens with proper structure
    res.status(200).json({
      success: true,
      data: {
        user: createUserResponse(user),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An unknown error occurred',
      });
    }
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (with refresh token)
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // Find user by ID and check if refresh token matches
    const user = await User.findById(decoded.id) as IUser;
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString());

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Return new tokens
    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An unknown error occurred',
      });
    }
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear refresh token in database
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    // Return success
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An unknown error occurred',
      });
    }
  }
};
