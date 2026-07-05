import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadCartProvider(savedCart = []) {
  let state;
  let initialized = false;
  const context = {
    JSON,
    localStorage: {
      getItem: (key) => (key === "cart" ? JSON.stringify(savedCart) : null),
      setItem: () => {},
    },
    createContext: () => ({}),
    useContext: () => null,
    useEffect: (effect) => effect(),
    useState: (initial) => {
      if (!initialized) {
        state = typeof initial === "function" ? initial() : initial;
        initialized = true;
      }
      return [
        state,
        (next) => {
          state = typeof next === "function" ? next(state) : next;
        },
      ];
    },
  };

  const source = readFileSync(new URL("../src/context/auth.context.jsx", import.meta.url), "utf8")
    .replace(/^import .+ from "react";\n/, "")
    .replace("export function CartProvider", "function CartProvider")
    .replace("export function useCart", "function useCart")
    .replace(
      /return \(\s*<CartContext\.Provider[\s\S]*?\n  \);\n}/,
      `return { items, addItem, removeItem, updateQty, clearCart, totalPrice };
}`
    );

  vm.runInNewContext(`${source}\nthis.CartProvider = CartProvider;`, context);

  return {
    act(action) {
      action(context.CartProvider({ children: null }));
      return context.CartProvider({ children: null });
    },
    value() {
      return context.CartProvider({ children: null });
    },
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("CartProvider supports cart mutations and totalPrice", () => {
  const cart = loadCartProvider();
  const rice = { id: 1, name: "Rice", unitprice: 10 };
  const egg = { id: 2, name: "Egg", unitprice: 4 };

  let value = cart.act(({ addItem }) => addItem(rice));
  assert.deepEqual(plain(value.items), [{ ingredient: rice, qty: 1 }]);
  assert.equal(value.totalPrice, 10);

  value = cart.act(({ addItem }) => addItem(rice));
  assert.equal(value.items[0].qty, 2);
  assert.equal(value.totalPrice, 20);

  value = cart.act(({ addItem }) => addItem(egg));
  assert.equal(value.items.length, 2);
  assert.equal(value.totalPrice, 24);

  value = cart.act(({ updateQty }) => updateQty(1, 3));
  assert.equal(value.items.find((item) => item.ingredient.id === 1).qty, 3);
  assert.equal(value.totalPrice, 34);

  value = cart.act(({ removeItem }) => removeItem(2));
  assert.deepEqual(plain(value.items), [{ ingredient: rice, qty: 3 }]);
  assert.equal(value.totalPrice, 30);

  value = cart.act(({ clearCart }) => clearCart());
  assert.deepEqual(plain(value.items), []);
  assert.equal(value.totalPrice, 0);
});
