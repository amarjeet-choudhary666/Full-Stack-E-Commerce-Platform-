import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await api.post('/users/refresh-token');
        const { accessToken } = refreshResponse.data.data;
        
        // Update cookie
        Cookies.set('accessToken', accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message || 'An error occurred';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (data: any) => api.post('/users/register', data),
  login: (data: any) => api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  verifyEmail: (token: string) => api.get(`/users/verify-email?token=${token}`),
  forgotPassword: (data: any) => api.post('/users/forgot-password', data),
  resetPassword: (token: string, data: any) => api.post(`/users/reset-password?token=${token}`, data),
  getCurrentUser: () => api.get('/users/profile'),
  refreshToken: () => api.post('/users/refresh-token'),
};

export const productAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getFeaturedProducts: (params?: any) => api.get('/products/featured', { params }),
  getProductsByCategory: (categoryId: string, params?: any) => 
    api.get(`/products/category/${categoryId}`, { params }),
  searchProducts: (params: any) => api.get('/products/search', { params }),
  createProduct: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id: string, data: FormData) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  updateStock: (id: string, data: any) => api.patch(`/products/${id}/stock`, data),
};

export const categoryAPI = {
  getCategories: (params?: any) => api.get('/categories', { params }),
  getCategory: (id: string) => api.get(`/categories/${id}`),
  getCategoryTree: () => api.get('/categories/tree'),
  getPopularCategories: (params?: any) => api.get('/categories/popular', { params }),
  createCategory: (data: FormData) => api.post('/categories', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCategory: (id: string, data: FormData) => api.put(`/categories/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  getCartSummary: () => api.get('/cart/summary'),
  addToCart: (data: any) => api.post('/cart/add', data),
  updateCartItem: (data: any) => api.put('/cart/update', data),
  removeFromCart: (productId: string) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
  syncPrices: () => api.post('/cart/sync-prices'),
};

export const orderAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getUserOrders: (params?: any) => api.get('/orders/my-orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  cancelOrder: (id: string, data?: any) => api.patch(`/orders/${id}/cancel`, data),
  getAllOrders: (params?: any) => api.get('/orders', { params }),
  updateOrderStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  getOrderStats: (params?: any) => api.get('/orders/stats/overview', { params }),
};

export const addressAPI = {
  getAddresses: () => api.get('/addresses'),
  getAddress: (id: string) => api.get(`/addresses/${id}`),
  getDefaultAddress: () => api.get('/addresses/default'),
  createAddress: (data: any) => api.post('/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id: string) => api.patch(`/addresses/${id}/set-default`),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  getWishlistSummary: () => api.get('/wishlist/summary'),
  checkWishlistItem: (productId: string) => api.get(`/wishlist/check/${productId}`),
  addToWishlist: (data: any) => api.post('/wishlist/add', data),
  removeFromWishlist: (productId: string) => api.delete(`/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete('/wishlist/clear'),
  moveToCart: (data: any) => api.post('/wishlist/move-to-cart', data),
};

export const reviewAPI = {
  getProductReviews: (productId: string, params?: any) => 
    api.get(`/reviews/product/${productId}`, { params }),
  getReviewStats: (productId: string) => api.get(`/reviews/product/${productId}/stats`),
  createReview: (data: FormData) => api.post('/reviews', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserReviews: (params?: any) => api.get('/reviews/my-reviews', { params }),
  updateReview: (id: string, data: FormData) => api.put(`/reviews/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  markHelpful: (id: string) => api.patch(`/reviews/${id}/helpful`),
  getAllReviews: (params?: any) => api.get('/reviews', { params }),
  updateReviewStatus: (id: string, data: any) => api.patch(`/reviews/${id}/status`, data),
};

export const couponAPI = {
  getActiveCoupons: (params?: any) => api.get('/coupons/active', { params }),
  validateCoupon: (data: any) => api.post('/coupons/validate', data),
  applyCoupon: (data: any) => api.post('/coupons/apply', data),
  getAllCoupons: (params?: any) => api.get('/coupons', { params }),
  getCoupon: (id: string) => api.get(`/coupons/${id}`),
  createCoupon: (data: any) => api.post('/coupons', data),
  updateCoupon: (id: string, data: any) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
};

export const adminAPI = {
  getDashboardOverview: (params?: any) => api.get('/admin/dashboard/overview', { params }),
  getSalesAnalytics: (params?: any) => api.get('/admin/analytics/sales', { params }),
  getTopProducts: (params?: any) => api.get('/admin/analytics/top-products', { params }),
  getCustomerAnalytics: (params?: any) => api.get('/admin/analytics/customers', { params }),
  getInventoryAlerts: (params?: any) => api.get('/admin/inventory/alerts', { params }),
  getOrderStatusDistribution: (params?: any) => api.get('/admin/orders/status-distribution', { params }),
  getRecentActivities: (params?: any) => api.get('/admin/activities/recent', { params }),
};

export default api;