import api from '../lib/api';

interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string;
    bio?: string;
    isAdmin: boolean;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with user data and tokens
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Making registration API call with data:', {
      ...userData,
      password: '******' // Don't log actual password
    });
    
    const response = await api.post('/auth/register', userData);
    console.log('Registration API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration API error:', error);
    throw error;
  }
};

/**
 * Login user
 * @param loginData User login data
 * @returns Promise with user data and tokens
 */
export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', loginData);
  return response.data;
};

/**
 * Refresh access token
 * @param refreshToken Refresh token
 * @returns Promise with new tokens
 */
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data;
};

/**
 * Logout user
 * @returns Promise with success message
 */
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
