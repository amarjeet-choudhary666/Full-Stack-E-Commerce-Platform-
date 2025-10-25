import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { wishlistAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface WishlistItem {
  product_id: {
    _id: string;
    name: string;
    price: number;
    discount_price?: number;
    images: string[];
    stock_quantity: number;
    status: string;
    slug: string;
    category_id: {
      name: string;
      slug: string;
    };
  };
  added_at: string;
}

export interface Wishlist {
  _id: string;
  user_id: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistItemCount: () => number;
  moveToCart: (productId: string, quantity?: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.data.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      setIsLoading(true);
      await wishlistAPI.addToWishlist({ product_id: productId });
      await refreshWishlist();
      toast.success('Item added to wishlist');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add item to wishlist';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await wishlistAPI.removeFromWishlist(productId);
      await refreshWishlist();
      toast.success('Item removed from wishlist');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await wishlistAPI.clearWishlist();
      await refreshWishlist();
      toast.success('Wishlist cleared');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear wishlist';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const moveToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await wishlistAPI.moveToCart({ product_id: productId, quantity });
      await refreshWishlist();
      toast.success('Item moved to cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to move item to cart';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist?.items.some(item => item.product_id._id === productId) || false;
  };

  const getWishlistItemCount = (): number => {
    return wishlist?.items.length || 0;
  };

  const value: WishlistContextType = {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    refreshWishlist,
    isInWishlist,
    getWishlistItemCount,
    moveToCart,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};