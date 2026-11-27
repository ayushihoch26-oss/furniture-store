import { useEffect, useMemo, useState } from "react";
import { getInvoiceStats } from "../services/invoice.service";
import { DEFAULT_COUNTS } from "../constants/invoice.constants";
import { errorText, formatMoney, getPayload } from "../utils/invoice.utils";

export default function useInvoiceStats() {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = getPayload(await getInvoiceStats());
        if (!active) return;
        setCounts({
          total: Number(result?.total ?? 0),
          revenue: Number(result?.revenue ?? 0),
          card: Number(result?.card ?? 0),
          cod: Number(result?.cod ?? 0),
          changes: result?.changes ?? DEFAULT_COUNTS.changes,
        });
      } catch (error) {
        console.error(
          "Failed to load invoice statistics:",
          errorText(error, "Unknown error"),
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { title: "Total Invoices", value: counts.total, change: counts.changes.total },
      {
        title: "Total Revenue",
        value: formatMoney(counts.revenue),
        change: counts.changes.revenue,
      },
      { title: "Card Payments", value: counts.card, change: counts.changes.card },
      { title: "Cash on Delivery", value: counts.cod, change: counts.changes.cod },
    ],
    [counts],
  );

  return { counts, stats };
}
