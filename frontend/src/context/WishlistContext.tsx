'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  prescriptionRequired: boolean;
  imageType?: 'syrup' | 'tablet' | 'drops' | 'cream' | 'spray' | 'cosmetic' | 'device';
  brand: string;
  category: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: Omit<WishlistItem, 'quantity'>) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('michu_wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist data', e);
      }
    }
  }, []);

  // Save wishlist to localStorage on change
  useEffect(() => {
    localStorage.setItem('michu_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = React.useCallback((product: Omit<WishlistItem, 'quantity'>) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product as WishlistItem];
    });
  }, []);

  const removeFromWishlist = React.useCallback((id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isInWishlist = React.useCallback((id: string) => {
    return wishlistItems.some((item) => item.id === id);
  }, [wishlistItems]);

  const clearWishlist = React.useCallback(() => {
    setWishlistItems([]);
  }, []);

  const wishlistCount = React.useMemo(() => wishlistItems.length, [wishlistItems]);

  const contextValue = React.useMemo(
    () => ({
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      wishlistCount,
    }),
    [wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, wishlistCount]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
