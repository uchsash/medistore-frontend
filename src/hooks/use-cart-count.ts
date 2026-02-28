// "use client";

// import { useEffect, useState } from "react";
// import { CART_CUSTOM_EVENT, CART_STORAGE_KEY, getCartCount } from "@/lib/cart";

// export function useCartCount() {

//   const [count, setCount] = useState<number>(() => {
//     if (typeof window === "undefined") return 0;
//     return getCartCount();
//   });

//   useEffect(() => {
//     const onCartChange = () => setCount(getCartCount());


//     window.addEventListener(CART_CUSTOM_EVENT, onCartChange);


//     const onStorage = (e: StorageEvent) => {
//       if (e.key === CART_STORAGE_KEY) onCartChange();
//     };
//     window.addEventListener("storage", onStorage);

//     return () => {
//       window.removeEventListener(CART_CUSTOM_EVENT, onCartChange);
//       window.removeEventListener("storage", onStorage);
//     };
//   }, []);

//   return count;
// }

//
//
//

"use client";

import { useSyncExternalStore } from "react";
import { getCartCount, CART_CUSTOM_EVENT, CART_STORAGE_KEY } from "@/lib/cart"; // adjust path if different

function subscribe(onStoreChange: () => void) {
  // Same-tab updates (your custom event)
  const onCustom = () => onStoreChange();

  // Cross-tab updates (storage event)
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(CART_CUSTOM_EVENT, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CART_CUSTOM_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return getCartCount();
}

// This is used during SSR / pre-hydration. Return a stable value.
function getServerSnapshot() {
  return 0;
}

export function useCartCount() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}