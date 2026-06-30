import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Cart state , hold onto localStorage in json format
  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  const addItem = (ingredient) => {
    
    setItems((currentItems) => {
      // exist item means ingredient id mathced
      const exists = currentItems.some(
        (item) => item.ingredient.id === ingredient.id
      );

      if (exists) {
        // iterate over array to find items with overlapping id, adds qty
        return currentItems.map((item) =>
          item.ingredient.id === ingredient.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      // 
      return [...currentItems, { ingredient, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.ingredient.id !== id)
    );
  };

  const updateQty = (id, qty) => {
    // Increment or decrement

    // Decrement 
    if (qty <= 0) {
      removeItem(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.ingredient.id === id ? { ...item, qty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // ponytail: recomputes every render, wrap in useMemo if perf matters
  const totalPrice = items.reduce(
    (sum, { ingredient, qty }) => sum + ingredient.unitprice * qty,
    0
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === null) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
