import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
};

// Action types
const CART_ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ITEMS: 'SET_ITEMS',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
};

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case CART_ACTION_TYPES.SET_ITEMS:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null,
      };

    case CART_ACTION_TYPES.ADD_ITEM: {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => 
        item.id === newItem.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions)
      );

      let updatedItems;
      if (existingItemIndex !== -1) {
        // Item already exists, update quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // New item, add to cart
        updatedItems = [...state.items, { ...newItem, cartItemId: Date.now() }];
      }

      return {
        ...state,
        items: updatedItems,
        error: null,
      };
    }

    case CART_ACTION_TYPES.UPDATE_ITEM: {
      const { itemId, updates } = action.payload;
      const updatedItems = state.items.map(item =>
        item.cartItemId === itemId || item.id === itemId
          ? { ...item, ...updates }
          : item
      );

      return {
        ...state,
        items: updatedItems,
        error: null,
      };
    }

    case CART_ACTION_TYPES.REMOVE_ITEM: {
      const itemId = action.payload;
      const updatedItems = state.items.filter(item =>
        item.cartItemId !== itemId && item.id !== itemId
      );

      return {
        ...state,
        items: updatedItems,
        error: null,
      };
    }

    case CART_ACTION_TYPES.CLEAR_CART:
      return {
        ...state,
        items: [],
        error: null,
      };

    case CART_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
}

// Create context
const CartContext = createContext();

// Provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever items change
  useEffect(() => {
    saveCartToStorage();
  }, [state.items]);

  const loadCartFromStorage = async () => {
    try {
      dispatch({ type: CART_ACTION_TYPES.SET_LOADING, payload: true });
      
      const cartData = await AsyncStorage.getItem('cart_items');
      if (cartData) {
        const items = JSON.parse(cartData);
        dispatch({ type: CART_ACTION_TYPES.SET_ITEMS, payload: items });
      } else {
        dispatch({ type: CART_ACTION_TYPES.SET_ITEMS, payload: [] });
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      dispatch({ type: CART_ACTION_TYPES.SET_ERROR, payload: error.message });
      dispatch({ type: CART_ACTION_TYPES.SET_ITEMS, payload: [] });
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem('cart_items', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const addToCart = (item) => {
    if (!item || !item.id) {
      dispatch({ type: CART_ACTION_TYPES.SET_ERROR, payload: 'Invalid item' });
      return;
    }

    const cartItem = {
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image || item.images?.[0],
      sellerId: item.sellerId,
      quantity: item.quantity || 1,
      selectedOptions: item.selectedOptions || [],
      notes: item.notes || '',
      deliveryInfo: item.deliveryInfo || '',
      maxQuantity: item.maxQuantity || 99,
      stockStatus: item.stockStatus || 'in_stock',
      seller: item.seller,
    };

    dispatch({ type: CART_ACTION_TYPES.ADD_ITEM, payload: cartItem });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    dispatch({
      type: CART_ACTION_TYPES.UPDATE_ITEM,
      payload: { itemId, updates: { quantity } }
    });
  };

  const updateItemNotes = (itemId, notes) => {
    dispatch({
      type: CART_ACTION_TYPES.UPDATE_ITEM,
      payload: { itemId, updates: { notes } }
    });
  };

  const updateSelectedOptions = (itemId, selectedOptions) => {
    dispatch({
      type: CART_ACTION_TYPES.UPDATE_ITEM,
      payload: { itemId, updates: { selectedOptions } }
    });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: CART_ACTION_TYPES.REMOVE_ITEM, payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTION_TYPES.CLEAR_CART });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  };

  const getCartWeight = () => {
    return state.items.reduce((weight, item) => {
      const itemWeight = item.weight || 0;
      return weight + (itemWeight * item.quantity);
    }, 0);
  };

  const getUniqueSellerCount = () => {
    const sellerIds = new Set(state.items.map(item => item.sellerId));
    return sellerIds.size;
  };

  const getItemsBySeller = () => {
    const sellerGroups = {};
    
    state.items.forEach(item => {
      const sellerId = item.sellerId;
      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          seller: item.seller,
          items: [],
          total: 0,
        };
      }
      
      sellerGroups[sellerId].items.push(item);
      sellerGroups[sellerId].total += item.price * item.quantity;
    });
    
    return sellerGroups;
  };

  const isItemInCart = (itemId, selectedOptions = []) => {
    return state.items.some(item =>
      item.id === itemId &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );
  };

  const getItemQuantityInCart = (itemId, selectedOptions = []) => {
    const item = state.items.find(item =>
      item.id === itemId &&
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );
    
    return item ? item.quantity : 0;
  };

  const validateCart = () => {
    const errors = [];
    
    state.items.forEach(item => {
      // Check stock status
      if (item.stockStatus === 'out_of_stock') {
        errors.push(`${item.title} is out of stock`);
      }
      
      // Check quantity limits
      if (item.maxQuantity && item.quantity > item.maxQuantity) {
        errors.push(`${item.title} quantity exceeds maximum (${item.maxQuantity})`);
      }
      
      // Check minimum price
      if (item.price <= 0) {
        errors.push(`${item.title} has invalid price`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const getEstimatedDeliveryFee = () => {
    const baseDeliveryFee = 3.99;
    const sellerCount = getUniqueSellerCount();
    
    // Additional fee for multiple sellers
    const multiSellerFee = sellerCount > 1 ? (sellerCount - 1) * 1.99 : 0;
    
    return baseDeliveryFee + multiSellerFee;
  };

  const getServiceFee = () => {
    const cartTotal = getCartTotal();
    const serviceFeePercentage = 0.05; // 5%
    const minServiceFee = 1.99;
    const maxServiceFee = 9.99;
    
    const calculatedFee = cartTotal * serviceFeePercentage;
    return Math.min(Math.max(calculatedFee, minServiceFee), maxServiceFee);
  };

  const getTotalWithFees = () => {
    const subtotal = getCartTotal();
    const deliveryFee = getEstimatedDeliveryFee();
    const serviceFee = getServiceFee();
    const tax = subtotal * 0.08; // 8% tax
    
    return subtotal + deliveryFee + serviceFee + tax;
  };

  const applyPromoCode = async (promoCode) => {
    try {
      // This would typically call an API to validate the promo code
      // For now, we'll simulate it
      const validPromoCodes = {
        'SAVE10': { type: 'percentage', value: 10, description: '10% off' },
        'FREESHIP': { type: 'free_shipping', value: 0, description: 'Free shipping' },
        'SAVE5': { type: 'fixed', value: 5, description: '$5 off' },
      };
      
      const promo = validPromoCodes[promoCode.toUpperCase()];
      
      if (!promo) {
        throw new Error('Invalid promo code');
      }
      
      return {
        success: true,
        promo,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const clearError = () => {
    dispatch({ type: CART_ACTION_TYPES.SET_ERROR, payload: null });
  };

  // Context value
  const value = {
    // State
    cartItems: state.items,
    loading: state.loading,
    error: state.error,

    // Actions
    addToCart,
    updateQuantity,
    updateItemNotes,
    updateSelectedOptions,
    removeFromCart,
    clearCart,
    clearError,

    // Getters
    getCartTotal,
    getCartItemCount,
    getCartWeight,
    getUniqueSellerCount,
    getItemsBySeller,
    isItemInCart,
    getItemQuantityInCart,
    validateCart,
    getEstimatedDeliveryFee,
    getServiceFee,
    getTotalWithFees,

    // Utilities
    applyPromoCode,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}

export default CartContext;
