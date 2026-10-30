import invoiceService from "../service/invoice.service.js";

// Invoice for one order
export const getByOrder = async (req, res, next) => {
  try {
    const data = await invoiceService.getByOrderId(
      req.params.orderId,
      req.user,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices?page=1&limit=10&search=&paymentMethod=&fromDate=&toDate=&minTotal=&maxTotal=&sortBy=date&sortOrder=desc
export const list = async (req, res, next) => {
  try {
    const data = await invoiceService.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/stats
export const stats = async (req, res, next) => {
  try {
    const data = await invoiceService.stats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
