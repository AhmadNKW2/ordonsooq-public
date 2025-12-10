"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product, WishlistItem } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

type WishlistAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; payload: WishlistItem[] };

const initialState: WishlistState = {
  items: [],
  isLoading: true,
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "ADD_ITEM": {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return state;
      }
      
      const newItem: WishlistItem = {
        id: product.id,
        product,
        addedAt: new Date().toISOString(),
      };
      
      return { ...state, items: [...state.items, newItem] };
    }
    
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    }
    
    case "CLEAR_WISHLIST": {
      return { ...state, items: [] };
    }
    
    case "LOAD_WISHLIST": {
      return { ...state, items: action.payload, isLoading: false };
    }
    
    default:
      return state;
  }
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(STORAGE_KEYS.wishlist);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        dispatch({ type: "LOAD_WISHLIST", payload: parsedWishlist });
      } else {
        dispatch({ type: "LOAD_WISHLIST", payload: [] });
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage:", error);
      dispatch({ type: "LOAD_WISHLIST", payload: [] });
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(state.items));
    }
  }, [state.items, state.isLoading]);

  const addItem = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const isInWishlist = (productId: string) => {
    return state.items.some((item) => item.product.id === productId);
  };

  const toggleItem = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        isLoading: state.isLoading,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist,
        toggleItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
