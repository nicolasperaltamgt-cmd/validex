"use client";

import Link from "next/link";
import { StateMessage } from "@/components/ui/StateMessage";
import { buttonClass } from "@/components/ui/button";
import { t } from "@/i18n";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <StateMessage
      kind="error"
      title={t.states.errorTitle}
      action={
        <>
          <button type="button" onClick={reset} className={buttonClass("primary")}>
            {t.actions.retry}
          </button>
          <Link href="/" className={buttonClass("secondary")}>
            {t.actions.backHome}
          </Link>
        </>
      }
    >
      {t.states.errorBody}
    </StateMessage>
  );
}
