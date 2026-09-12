"use client";

// components/auth-init.tsx
// Mount once at the root layout. Boots the auth listener and refreshes
// cart/wishlist/orders whenever the signed-in user changes.

import { useEffect } from "react";
import { useAuth, useCart, useWishlist, useOrders } from "@/lib/store";

export function AuthInit() {
  const init = useAuth((s) => s.init);
  const user = useAuth((s) => s.user);

  // Boot the auth listener on first mount
  useEffect(() => {
    init();
  }, [init]);

  // Whenever the user changes (login / logout / signup), refresh their
  // server-side state into the local Zustand stores.
  useEffect(() => {
    useCart.getState().refresh();
    useWishlist.getState().refresh();
    useOrders.getState().refresh();
  }, [user?.id]);

  return null;
}
