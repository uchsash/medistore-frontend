export type CartItem = {
  medId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

const CART_KEY = "medistore_cart";
const CART_EVENT = "medistore:cart";

function safeParse(json: string | null): CartItem[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(CART_KEY));
}

export function getCartCount(): number {
  const items = getCartItems();
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

function save(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  // notify same-tab listeners
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  if (typeof window === "undefined") return;

  const items = getCartItems();
  const idx = items.findIndex((i) => i.medId === item.medId);

  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      quantity: Math.max(1, (items[idx].quantity ?? 1) + qty),
    };
  } else {
    items.push({ ...item, quantity: Math.max(1, qty) });
  }

  save(items);
}

export function removeFromCart(medId: string) {
  if (typeof window === "undefined") return;
  const items = getCartItems().filter((i) => i.medId !== medId);
  save(items);
}

export function clearCart() {
  if (typeof window === "undefined") return;
  save([]);
}

export function setItemQuantity(medId: string, quantity: number) {
  if (typeof window === "undefined") return;

  const q = Math.max(1, Math.floor(quantity));
  const items = getCartItems().map((i) => (i.medId === medId ? { ...i, quantity: q } : i));
  save(items);
}

export const CART_STORAGE_KEY = CART_KEY;
export const CART_CUSTOM_EVENT = CART_EVENT;