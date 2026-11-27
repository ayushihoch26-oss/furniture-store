import { useCallback, useEffect, useRef, useState } from "react";
import { getInvoices } from "../services/invoice.service";
import { DEFAULT_FILTERS, MESSAGES } from "../constants/invoice.constants";
import { errorText, getPayload, mapInvoiceRows } from "../utils/invoice.utils";

/**
 * Owns filters (page / search / filter / sort) and loads the invoice list
 * whenever they change.
 */
export default function useInvoices({ onError }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [invoices, setInvoices] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const latestRequest = useRef(0);

  // Any change except page resets to page 1.
  const updateFilters = useCallback((patch) => {
    setFilters((previous) => ({
      ...previous,
      ...(patch.page === undefined ? { page: 1 } : {}),
      ...patch,
    }));
  }, []);

  useEffect(() => {
    const requestId = ++latestRequest.current;

    const run = async () => {
      setLoading(true);
      try {
        const payload = getPayload(await getInvoices(filters));
        if (requestId !== latestRequest.current) return; // outdated response

        const pages = Math.max(1, Number(payload.totalPages) || 1);

        if (filters.page > pages) {
          setFilters((previous) => ({ ...previous, page: pages }));
          return;
        }

        setInvoices(mapInvoiceRows(payload.rows));
        setTotalItems(Number(payload.totalItems) || 0);
        setTotalPages(pages);
      } catch (error) {
        if (requestId === latestRequest.current) {
          onError(errorText(error, MESSAGES.loadFailed));
        }
      } finally {
        if (requestId === latestRequest.current) setLoading(false);
      }
    };

    run();
  }, [filters, onError]);

  return { filters, updateFilters, invoices, totalItems, totalPages, loading };
}
