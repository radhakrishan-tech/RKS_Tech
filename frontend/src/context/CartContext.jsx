import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

function normalizeCartItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => item && typeof item === "object" && item._id)
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity) || 1),
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || null,
    }));
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return normalizeCartItems(JSON.parse(localStorage.getItem("rks_cart") || "[]"));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("rks_cart", JSON.stringify(normalizeCartItems(cartItems)));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const safePrev = normalizeCartItems(prev);
      // Merge by productId + selectedSize + selectedColor
      const key = (item) => `${item._id}-${item.selectedSize || ''}-${item.selectedColor?.hex || ''}`;
      const newKey = key(product);
      const existing = safePrev.find((item) => key(item) === newKey);
      if (existing) {
        return safePrev.map((item) =>
          key(item) === newKey
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 999) }
            : item
        );
      }
      return [
        ...safePrev,
        {
          _id: product._id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock,
          quantity,
          selectedSize: product.selectedSize || "",
          selectedColor: product.selectedColor || null,
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCartItems((prev) =>
      normalizeCartItems(prev)
        .map((item) => (item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => normalizeCartItems(prev).filter((item) => item._id !== id));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = useMemo(
    () => normalizeCartItems(cartItems).reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
