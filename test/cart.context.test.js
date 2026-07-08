import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test, expect } from "vitest";

// Minimal React stub for the vm sandbox — avoids a full React import.
// Tracks a single state array so multiple useState calls in one component work.
function buildContext(savedCart = []) {
  const stateStore = [];
  let hookIdx = 0;

  return {
    JSON,
    localStorage: {
      getItem: (key) => (key === "cart" ? JSON.stringify(savedCart) : null),
      setItem: () => {},
    },
    createContext: () => ({}),
    useContext:    () => null,
    useEffect:     (fn) => fn?.(),
    useState: (initial) => {
      const i = hookIdx++;
      if (stateStore[i] === undefined)
        stateStore[i] = typeof initial === "function" ? initial() : initial;
      return [
        stateStore[i],
        (next) => { stateStore[i] = typeof next === "function" ? next(stateStore[i]) : next; },
      ];
    },
    // exposed so act() can reset hook call order each invocation
    _reset: () => { hookIdx = 0; },
  };
}

function loadCartProvider(savedCart = []) {
  const ctx = buildContext(savedCart);

  // Strip React import + JSX provider return so vm can run plain JS
  const source = readFileSync(
    new URL("../src/context/cart.context.jsx", import.meta.url), // was wrongly auth.context.jsx
    "utf8"
  )
    .replace(/^import .+ from "react";\n/, "")
    .replace("export function CartProvider", "function CartProvider")
    .replace("export function useCart",    "function useCart")
    .replace(
      /return \(\s*<CartContext\.Provider[\s\S]*?\n  \);\n}/,
      `return { items, addItem, removeItem, updateQty, clearCart, totalPrice };\n}`
    );

  vm.runInNewContext(`${source}\nthis.CartProvider = CartProvider;`, ctx);

  return {
    // Execute a mutation then re-read updated state
    act(action) {
      ctx._reset();
      action(ctx.CartProvider({ children: null }));
      ctx._reset();
      return ctx.CartProvider({ children: null });
    },
    value() {
      ctx._reset();
      return ctx.CartProvider({ children: null });
    },
  };
}

// Deep-clone strips non-serialisable artefacts from vm objects
const plain = (v) => JSON.parse(JSON.stringify(v));

test("CartProvider: add, duplicate, update, remove, clear + totalPrice", () => {
  const cart = loadCartProvider();
  const rice = { id: 1, name: "Rice", unitPrice: 10 }; // unitPrice — matches cart.context.jsx:61
  const egg  = { id: 2, name: "Egg",  unitPrice: 4  };

  let v = cart.act(({ addItem }) => addItem(rice));
  expect(plain(v.items)).toEqual([{ ingredient: rice, qty: 1 }]);
  expect(v.totalPrice).toBe(10);

  v = cart.act(({ addItem }) => addItem(rice)); // duplicate → bump qty
  expect(v.items[0].qty).toBe(2);
  expect(v.totalPrice).toBe(20);

  v = cart.act(({ addItem }) => addItem(egg));
  expect(v.items.length).toBe(2);
  expect(v.totalPrice).toBe(24);

  v = cart.act(({ updateQty }) => updateQty(1, 3));
  expect(v.items.find((i) => i.ingredient.id === 1).qty).toBe(3);
  expect(v.totalPrice).toBe(34);

  v = cart.act(({ removeItem }) => removeItem(2));
  expect(plain(v.items)).toEqual([{ ingredient: rice, qty: 3 }]);
  expect(v.totalPrice).toBe(30);

  v = cart.act(({ clearCart }) => clearCart());
  expect(plain(v.items)).toEqual([]);
  expect(v.totalPrice).toBe(0);
});

test("CartProvider: updateQty(id, 0) removes item", () => {
  const cart = loadCartProvider();
  const salt = { id: 3, name: "Salt", unitPrice: 2 };
  cart.act(({ addItem }) => addItem(salt));
  const v = cart.act(({ updateQty }) => updateQty(3, 0));
  expect(plain(v.items)).toEqual([]);
});

test("CartProvider: loads persisted cart from localStorage", () => {
  const saved = [{ ingredient: { id: 5, name: "Sugar", unitPrice: 3 }, qty: 4 }];
  const cart  = loadCartProvider(saved);
  const v     = cart.value();
  expect(v.items.length).toBe(1);
  expect(v.totalPrice).toBe(12);
});
