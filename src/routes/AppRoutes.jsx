import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const DashboardPage = lazy(
  () => import("../features/dashboard/pages/DashboardPage"),
);
const AboutUsPage = lazy(() => import("../features/about/pages/AboutUsPage"));
const ShopPage = lazy(() => import("../features/shop/pages/ShopPage"));
const ContactPage = lazy(() => import("../features/contact/pages/ContactPage"));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("../features/auth/pages/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("../features/auth/pages/ResetPasswordPage"),
);
const CartPage = lazy(() => import("../features/cart/pages/CartPage"));
const CheckoutPage = lazy(
  () => import("../features/checkout/pages/CheckoutPage"),
);
const ProfilePage = lazy(() => import("../features/profile/pages/ProfilePage"));
const WishlistPage = lazy(
  () => import("../features/wishlist/pages/WishlistPage"),
);
const AdminDashboardPage = lazy(
  () => import("../features/admin/pages/AdminDashboardPage"),
);
const AdminOrdersPage = lazy(
  () => import("../features/admin/pages/AdminOrdersPage"),
);
const AdminCustomersPage = lazy(
  () => import("../features/admin/pages/AdminCustomersPage"),
);
const AdminCartPage = lazy(
  () => import("../features/admin/pages/AdminCartPage"),
);
const AdminProductsPage = lazy(
  () => import("../features/admin/pages/AdminProductsPage"),
);
const AdminContactPage = lazy(
  () => import("../features/admin/pages/AdminContactPage"),
);
const AdminRolesPage = lazy(
  () => import("../features/admin/pages/AdminRolesPage"),
);
const AdminAuthorityPage = lazy(
  () => import("../features/admin/pages/AdminAuthorityPage"),
);
const AdminWishlistPage = lazy(
  () => import("../features/admin/pages/AdminWishlistPage"),
);
const AdminCategoriesPage = lazy(
  () => import("../features/admin/pages/AdminCategoriesPage"),
);
const AdminInvoicePage = lazy(
  () => import("../features/admin/pages/AdminInvoicePage"),
);

function RouteLoading() {
  return (
    <Box
      sx={{
        display: "grid",
        minHeight: "100vh",
        placeItems: "center",
      }}
    >
      <CircularProgress sx={{ color: "#947458" }} />
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/Dashboard" element={<DashboardPage />} />
        <Route path="/AboutUs" element={<AboutUsPage />} />
        <Route path="/Shop" element={<ShopPage />} />
        <Route path="/Contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:token"
          element={<ResetPasswordPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/Checkout" element={<CheckoutPage />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/Wishlist" element={<WishlistPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orderManagement" element={<AdminOrdersPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/cart" element={<AdminCartPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/contactus" element={<AdminContactPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
          <Route path="/admin/authority" element={<AdminAuthorityPage />} />
          <Route path="/admin/wishlist" element={<AdminWishlistPage />} />
          <Route path="/admin/category" element={<AdminCategoriesPage />} />
          <Route path="/admin/invoice" element={<AdminInvoicePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
