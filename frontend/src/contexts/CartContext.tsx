import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { cartAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface CartItem {
  product_id: {
    _id: string;
    name: string;
    price: number;
    discount_price?: number;
    images: string[];
    stock_quantity: number;
    status: string;
    slug: string;
  };
  quantity: number;
  price: number;
  added_at: string;
}

export interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
  total_items: number;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      setIsLoading(true);
      await cartAPI.addToCart({ product_id: productId, quantity });
      await refreshCart();
      toast.success('Item added to cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await cartAPI.updateCartItem({ product_id: productId, quantity });
      await refreshCart();
      toast.success('Cart updated');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await cartAPI.removeFromCart(productId);
      await refreshCart();
      toast.success('Item removed from cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await cartAPI.clearCart();
      await refreshCart();
      toast.success('Cart cleared');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCartItemCount = (): number => {
    return cart?.total_items || 0;
  };

  const getCartTotal = (): number => {
    return cart?.total_amount || 0;
  };

  const isInCart = (productId: string): boolean => {
    return cart?.items.some(item => item.product_id._id === productId) || false;
  };

  const getCartItemQuantity = (productId: string): number => {
    const item = cart?.items.find(item => item.product_id._id === productId);
    return item?.quantity || 0;
  };

  const value: CartContextType = {
    cart,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartItemCount,
    getCartTotal,
    isInCart,
    getCartItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};