"use client";

import { useActionState } from "react";
import { fetchHistoricalSeries, initialHistoricalPriceChartState } from "./_actions";
import { Presentation } from "./Presentation";

export function Container() {
  const [state, formAction, isPending] = useActionState(
    fetchHistoricalSeries,
    initialHistoricalPriceChartState,
  );

  return <Presentation state={state} formAction={formAction} isPending={isPending} />;
}
