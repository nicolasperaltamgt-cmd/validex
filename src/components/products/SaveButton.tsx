"use client";

import { buttonClass } from "@/components/ui/button";
import { useSession } from "@/state/session-store";
import { t } from "@/i18n";
import { toast } from "sonner";

export function SaveButton({ productId, productName }: { productId: string; productName: string }) {
  const { isSaved, toggleSaved } = useSession();
  const saved = isSaved(productId);
  return (
    <button
      type="button"
      onClick={() => {
        toggleSaved(productId);
        toast(saved ? "Quitado de guardados" : "Guardado en tu lista");
      }}
      aria-pressed={saved}
      aria-label={`${saved ? t.actions.unsaveAria : t.actions.saveAria}: ${productName}`}
      className={buttonClass(saved ? "primary" : "secondary")}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 3h12v18l-6-4-6 4z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {saved ? t.actions.saved : t.actions.save}
    </button>
  );
}
