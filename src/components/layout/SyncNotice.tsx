"use client";

import { useSession } from "@/state/session-store";

/** Aviso visible en cualquier pantalla si no se pudo guardar un cambio en la cuenta. */
export function SyncNotice() {
  const { syncError } = useSession();
  if (!syncError) return null;
  return (
    <div role="alert" className="bg-danger-soft px-4 py-2 text-center text-sm font-medium text-danger">
      {syncError}
    </div>
  );
}
