import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getCart,
  addToCart as addProductToCart,
  updateCartItem as updateCartItemApi,
  removeFromCart as removeCartItemApi,
  clearCart as clearCartApi,
} from "../services/cartService";

const CartContext =
  createContext(null);

export const CartProvider = ({
  children,
}) => {
  const {
    user,
    token,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [cart, setCart] = useState({
    items: [],
  });

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // LOAD CART
  // ==========================================
  useEffect(() => {
    const loadCart = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !user || !token) {
        setCart({
          items: [],
        });

        return;
      }

      try {
        setLoading(true);

        const response =
          await getCart(token);

        setCart(
          response?.cart || {
            items: [],
          }
        );
      } catch (error) {
        console.error(
          "Cart loading error:",
          error.response?.data ||
            error.message
        );

        setCart({
          items: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [
    authLoading,
    isAuthenticated,
    user,
    token,
  ]);

  // ==========================================
  // ADD TO CART
  // ==========================================
  const addToCart = async (
    productId,
    quantity = 1,
    variantId = null
  ) => {
    if (
      !isAuthenticated ||
      !token
    ) {
      throw new Error(
        "Please login to add products to cart."
      );
    }

    const response =
      await addProductToCart(
        token,
        productId,
        quantity,
        variantId
      );

    setCart(
      response?.cart || {
        items: [],
      }
    );

    return response;
  };

  // ==========================================
  // UPDATE CART ITEM
  // ==========================================
  const updateQuantity = async (
    itemId,
    quantity
  ) => {
    if (!token) {
      throw new Error(
        "Authentication required."
      );
    }

    const response =
      await updateCartItemApi(
        token,
        itemId,
        quantity
      );

    setCart(
      response?.cart || {
        items: [],
      }
    );

    return response;
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================
  const removeItem = async (
    itemId
  ) => {
    if (!token) {
      throw new Error(
        "Authentication required."
      );
    }

    const response =
      await removeCartItemApi(
        token,
        itemId
      );

    setCart(
      response?.cart || {
        items: [],
      }
    );

    return response;
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  const clearCart = async () => {
    if (!token) {
      throw new Error(
        "Authentication required."
      );
    }

    const response =
      await clearCartApi(token);

    setCart({
      ...(response?.cart || {}),
      items: [],
    });

    return response;
  };

  // ==========================================
  // CART COUNT
  // ==========================================
  const cartCount =
    cart.items?.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    ) || 0;

  // ==========================================
  // CART SUBTOTAL
  // ==========================================
  const cartSubtotal =
    cart.items?.reduce(
      (total, item) => {
        const product =
          item.product;

        if (!product) {
          return total;
        }

        let price =
          Number(
            product.discountPrice
          ) ||
          Number(product.price) ||
          0;

        // Use variant price when available
        if (item.variantId) {
          const variant =
            product.variants?.find(
              (variant) =>
                variant._id?.toString() ===
                item.variantId?.toString()
            );

          if (variant) {
            price =
              Number(
                variant.discountPrice
              ) ||
              Number(variant.price) ||
              price;
          }
        }

        return (
          total +
          price *
            Number(item.quantity || 0)
        );
      },
      0
    ) || 0;

  const value = {
    cart,
    setCart,
    loading,
    cartCount,
    cartSubtotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};

export default CartContext;