import Cookies from 'js-cookie';
import { authAPI } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  status: 'active' | 'blocked';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const getStoredAuth = (): { user: User | null; isAuthenticated: boolean } => {
  try {
    const userStr = localStorage.getItem('user');
    const accessToken = Cookies.get('accessToken');
    
    if (userStr && accessToken) {
      const user = JSON.parse(userStr);
      return { user, isAuthenticated: true };
    }
  } catch (error) {
    console.error('Error parsing stored auth:', error);
  }
  
  return { user: null, isAuthenticated: false };
};

export const setStoredAuth = (user: User, tokens: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem('user', JSON.stringify(user));
  Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
  Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
};

export const clearStoredAuth = () => {
  localStorage.removeItem('user');
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};

export const login = async (email: string, password: string, rememberMe: boolean = false) => {
  try {
    const response = await authAPI.login({ email, password, rememberMe });
    const { user, accessToken, refreshToken } = response.data.data;
    
    setStoredAuth(user, { accessToken, refreshToken });
    
    return { user, success: true };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await authAPI.register({ name, email, password });
    return { success: true, message: response.data.message };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearStoredAuth();
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await authAPI.getCurrentUser();
    const user = response.data.data.user;
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    clearStoredAuth();
    return null;
  }
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const isCustomer = (user: User | null): boolean => {
  return user?.role === 'customer';
};