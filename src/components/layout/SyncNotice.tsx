"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@/state/session-store";

/** Avisa con un toast, en cualquier pantalla, si no se pudo guardar un cambio en la cuenta. */
export function SyncNotice() {
  const { syncError } = useSession();
  useEffect(() => {
    if (syncError) toast.error(syncError, { id: "sync-error" });
  }, [syncError]);
  return null;
}
