import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { downloadInvoice } from "../page/invoice";
import { getInvoiceByOrder, getInvoiceError } from "../service/invoice.service";

const BROWN = "#947458";

const money = (value) => `$${(Number(value) || 0).toFixed(2)}`;

// Popup shown after an order is placed. Reusable: My Orders can open it too.
// It only needs `order.id` (9 or "#ORD0009") and loads the invoice from the API.
export default function InvoiceDialog({ open, order, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderId = order?.id;

  useEffect(() => {
    if (!open || !orderId) {
      // eslint-disable-next-line
      setInvoice(null);
      setError("");
      setLoading(false);
      return;
    }

    let active = true;

    const loadInvoice = async () => {
      setLoading(true);
      setError("");
      setInvoice(null);

      try {
        const data = await getInvoiceByOrder(orderId);

        if (active) {
          setInvoice(data);
        }
      } catch (err) {
        if (active) {
          setError(getInvoiceError(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInvoice();

    return () => {
      active = false;
    };
  }, [open, orderId]);

  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 0, p: 1 } } }}
    >
      <IconButton
        aria-label="Close"
        onClick={onClose}
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ textAlign: "center", pt: 4 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "rgba(148,116,88,.12)",
            color: BROWN,
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
          Your invoice is ready
        </Typography>

        {loading && <CircularProgress size={24} sx={{ color: BROWN, mt: 2 }} />}

        {error && (
          <Typography
            role="alert"
            sx={{ color: "#c62828", fontSize: 14, mt: 2 }}
          >
            {error}
          </Typography>
        )}

        {invoice && (
          <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 1 }}>
            Invoice <b>{invoice.invoiceNumber}</b> &middot; Order{" "}
            <b>{invoice.orderNumber}</b>
            <br />
            Total {money(invoice.total)}
            <br />
            Download a PDF copy for your records.
          </Typography>
        )}

        <Button
          fullWidth
          disabled={!invoice}
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={() => downloadInvoice(invoice)}
          sx={{
            mt: 3,
            height: 46,
            borderRadius: 0,
            bgcolor: BROWN,
            color: "#fff",
            textTransform: "none",
            fontSize: 15,
            "&:hover": { bgcolor: "#7d6048" },
            "&.Mui-disabled": { bgcolor: "#B9A18D", color: "#fff" },
          }}
        >
          Download invoice (PDF)
        </Button>

        <Button
          fullWidth
          onClick={onClose}
          sx={{
            mt: 1,
            height: 42,
            borderRadius: 0,
            color: "text.secondary",
            textTransform: "none",
          }}
        >
          Maybe later
        </Button>
      </DialogContent>
    </Dialog>
  );
}
