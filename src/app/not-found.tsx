import Link from "next/link";
import { StateMessage } from "@/components/ui/StateMessage";
import { buttonClass } from "@/components/ui/button";
import { t } from "@/i18n";

export default function NotFound() {
  return (
    <StateMessage
      kind="empty"
      title={t.states.notFoundTitle}
      action={
        <Link href="/catalogo" className={buttonClass("primary")}>
          {t.nav.catalog}
        </Link>
      }
    >
      {t.states.notFoundBody}
    </StateMessage>
  );
}
