import { useCallback, useState } from "react";
import { downloadInvoice } from "../../../invoice/utils/invoiceUtils";
import {
  getInvoiceByOrder,
  getInvoiceError,
} from "../../../invoice/services/invoice.service";

/** View popup + single-invoice PDF download. */
export default function useInvoiceActions({ onError }) {
  const [viewOrder, setViewOrder] = useState(null); // opens the invoice popup
  const [downloadingId, setDownloadingId] = useState(null);

  const handleView = useCallback(
    (item) => setViewOrder({ id: item.orderId }),
    [],
  );
  const closeView = useCallback(() => setViewOrder(null), []);

  const handleDownload = useCallback(
    async (item) => {
      setDownloadingId(item.id);
      try {
        const invoice = await getInvoiceByOrder(item.orderId);
        downloadInvoice(invoice);
      } catch (error) {
        onError(getInvoiceError(error));
      } finally {
        setDownloadingId(null);
      }
    },
    [onError],
  );

  return { viewOrder, handleView, closeView, downloadingId, handleDownload };
}
