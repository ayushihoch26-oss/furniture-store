import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./models/index.js";
import userRoute from "./router/users.route.js";
import contactUsRoute from "./router/contactus.route.js";
import orderRoute from "./router/ordermanagement.route.js";
import cartRoutes from "./router/cart.route.js";
import productRoutes from "./router/product.route.js";
import wishlistRoutes from "./router/wishlist.route.js";
import adminProfileRoutes from "./router/adminprofile.route.js";
import categoryroutes from "./router/category.route.js";
import authorityRoutes from "./router/authority.route.js";
import invoiceRoute from "./router/invoice.route.js";
import passwordRoute from "./router/password.route.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! Server is running successfully.");
});

app.get("/api", (req, res) => {
  res.json({ success: true, message: "Backend API is working!" });
});

// Routes (before the 404 handler)
app.use("/api/users", userRoute);
app.use("/api/contactus", contactUsRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoute);
app.use("/api/admin-profile", adminProfileRoutes);
app.use("/api/categories", categoryroutes); 
app.use("/api/authority", authorityRoutes);
app.use("/api/invoices", invoiceRoute);
app.use("/api/password", passwordRoute);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler (must be last)
// Error handler (must be last)
app.use((err, req, res, next) => {
  const status =
    err.statusCode ||
    err.status ||
    (err.name === "SequelizeValidationError" ? 400 : null) ||
    (err.name === "SequelizeUniqueConstraintError" ? 409 : null) ||
    500;

  res.status(status).json({
    success: false,
    message: err.message || "Server error",
  });
});

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ MySQL Connected");

    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌐 API: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
