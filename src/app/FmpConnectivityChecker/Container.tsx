"use client";

import { useActionState } from "react";
import { checkFmpConnectivity, initialFmpConnectivityState } from "./_actions";
import { Presentation } from "./Presentation";

function formatCheckedAt(iso?: string): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function Container() {
  const [state, formAction, isPending] = useActionState(
    checkFmpConnectivity,
    initialFmpConnectivityState,
  );

  return (
    <Presentation
      state={state}
      isPending={isPending}
      formAction={formAction}
      formattedCheckedAt={formatCheckedAt(state.checkedAt)}
    />
  );
}
