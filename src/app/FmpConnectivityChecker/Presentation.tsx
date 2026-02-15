import styles from "../page.module.css";
import type { FmpConnectivityState } from "./_actions";

type PresentationProps = {
  state: FmpConnectivityState;
  isPending: boolean;
  formAction: (formData: FormData) => void;
  formattedCheckedAt: string;
};

function stateClassName(status: FmpConnectivityState["status"]): string {
  if (status === "success") {
    return styles.statusSuccess;
  }
  if (status === "error") {
    return styles.statusError;
  }
  return styles.statusIdle;
}

function normalizeMojibakeMessage(message: string): string {
  const looksLikeMojibake = /[ÃãÂæå]/.test(message);
  if (!looksLikeMojibake) {
    return message;
  }

  try {
    const bytes = Uint8Array.from(message, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8").decode(bytes);
    return decoded.includes("�") ? message : decoded;
  } catch {
    return message;
  }
}

export function Presentation({
  state,
  isPending,
  formAction,
  formattedCheckedAt,
}: PresentationProps) {
  return (
    <section className={styles.connectivitySection} aria-live="polite">
      <h2>Financial Modeling Prep API</h2>
      <p>サーバーアクション経由で FMP API の疎通を確認します。</p>

      <form action={formAction} className={styles.connectivityForm}>
        <button
          type="submit"
          className={styles.connectivityButton}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "確認中..." : "FMP API 疎通確認"}
        </button>
      </form>

      <p className={stateClassName(state.status)}>{normalizeMojibakeMessage(state.message)}</p>

      {state.checkedAt ? (
        <p className={styles.statusMeta}>
          最終確認: {formattedCheckedAt}
          {state.symbol ? ` / ${state.symbol}` : ""}
          {typeof state.price === "number" ? ` / $${state.price.toFixed(2)}` : ""}
        </p>
      ) : null}
    </section>
  );
}
