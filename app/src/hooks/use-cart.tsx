"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product, ProductVariant, CartItem } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number; variant?: ProductVariant } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_IS_OPEN"; payload: boolean };

const initialState: CartState = {
  items: [],
  isLoading: true,
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity, variant } = action.payload;
      const itemId = variant ? `${product.id}-${variant.id}` : product.id;
      
      const existingItemIndex = state.items.findIndex((item) => item.id === itemId);
      
      let newItems;
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        newItems = updatedItems;
      } else {
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity,
          variant,
        };
        newItems = [...state.items, newItem];
      }
      
      return { ...state, items: newItems };
    }
    
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    }
    
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
        };
      }
      
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }
    
    case "CLEAR_CART": {
      return { ...state, items: [] };
    }
    
    case "LOAD_CART": {
      return { ...state, items: action.payload, isLoading: false };
    }

    case "SET_IS_OPEN": {
      return { ...state, isOpen: action.payload };
    }
    
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.cart);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: parsedCart });
      } else {
        dispatch({ type: "LOAD_CART", payload: [] });
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      dispatch({ type: "LOAD_CART", payload: [] });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.items));
    }
  }, [state.items, state.isLoading]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = state.items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity, variant } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const isInCart = (productId: string) => {
    return state.items.some((item) => item.product.id === productId);
  };

  const openCart = () => dispatch({ type: "SET_IS_OPEN", payload: true });
  const closeCart = () => dispatch({ type: "SET_IS_OPEN", payload: false });
  const toggleCart = () => dispatch({ type: "SET_IS_OPEN", payload: !state.isOpen });

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isLoading: state.isLoading,
        isOpen: state.isOpen,
        totalItems,
        subtotal,
        totalPrice: subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
