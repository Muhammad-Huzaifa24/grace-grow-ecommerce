import * as React from "react";

export type CartLine = {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  remove: (productId: string, variantId: string | null) => void;
  clear: () => void;
};

const STORAGE_KEY = "ore-cart-v1";
const CartContext = React.createContext<CartContextValue | null>(null);

const sameLine = (a: CartLine, productId: string, variantId: string | null) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const value = React.useMemo<CartContextValue>(() => {
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      add: (line, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => sameLine(l, line.productId, line.variantId));
          if (existing) {
            return prev.map((l) =>
              sameLine(l, line.productId, line.variantId)
                ? { ...l, quantity: l.quantity + quantity }
                : l,
            );
          }
          return [...prev, { ...line, quantity }];
        }),
      setQuantity: (productId, variantId, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => !sameLine(l, productId, variantId))
            : prev.map((l) => (sameLine(l, productId, variantId) ? { ...l, quantity } : l)),
        ),
      remove: (productId, variantId) =>
        setLines((prev) => prev.filter((l) => !sameLine(l, productId, variantId))),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
