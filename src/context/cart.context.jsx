import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ ingredient, qty }]

  // TODO: addItem(ingredient) — เพิ่ม ingredient เข้า cart
  //   ถ้ามีอยู่แล้ว → qty + 1
  //   ถ้าไม่มี → push { ingredient, qty: 1 }

  // TODO: removeItem(id) — ลบออกจาก items โดย ingredient.id

  // TODO: updateQty(id, qty) — เปลี่ยน qty, ถ้า qty <= 0 ให้ลบออก

  // TODO: clearCart() — reset items กลับเป็น []

  // TODO: totalPrice — คำนวณจาก items แต่ละตัว (ingredient.price * qty)
  //   ตอนนี้ ingredient ยังไม่มี price → ใส่ 0 ไปก่อน

  return (
    <CartContext.Provider value={{ items }}>
      {/* TODO: ใส่ addItem, removeItem, updateQty, clearCart, totalPrice ใน value ด้วย */}
      {children}
    </CartContext.Provider>
  );
}

// Custom hook — ใช้แทน useContext(CartContext) ตรงๆ
export function useCart() {
  const ctx = useContext(CartContext);
  // TODO: throw error ถ้า useCart ถูกเรียกนอก CartProvider
  return ctx;
}
