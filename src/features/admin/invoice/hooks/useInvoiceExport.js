import { useCallback, useState } from "react";
import { getInvoices } from "../services/invoice.service";
import {
  CSV_FILE_NAME,
  EXPORT_PAGE_LIMIT,
  MESSAGES,
} from "../constants/invoice.constants";
import {
  buildInvoiceCsv,
  downloadTextFile,
  errorText,
  getPayload,
} from "../utils/invoice.utils";

/** Export ALL invoices that match the current filters (not just this page). */
export default function useInvoiceExport({ filters, onError }) {
  const [exporting, setExporting] = useState(false);

  const exportCsv = useCallback(async () => {
    setExporting(true);
    try {
      let rows = [];
      let current = 1;
      let pages = 1;

      do {
        const payload = getPayload(
          await getInvoices({ ...filters, page: current, limit: EXPORT_PAGE_LIMIT }),
        );
        rows = rows.concat(payload.rows || []);
        pages = Number(payload.totalPages) || 1;
        current += 1;
      } while (current <= pages);

      if (rows.length === 0) {
        onError(MESSAGES.nothingToExport);
        return;
      }

      downloadTextFile(buildInvoiceCsv(rows), CSV_FILE_NAME);
    } catch (error) {
      onError(errorText(error, MESSAGES.exportFailed));
    } finally {
      setExporting(false);
    }
  }, [filters, onError]);

  return { exporting, exportCsv };
}
