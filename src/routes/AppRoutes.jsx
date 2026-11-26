
import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// public pages
export const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
export const AboutUsPage = lazy(() => import("../features/about/pages/AboutUsPage"));
export const ShopPage = lazy(() => import("../features/shop/pages/ShopPage"));
export const ContactPage = lazy(() => import("../features/contact/pages/ContactPage"));

// auth pages
export const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
export const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
export const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"));
export const ResetPasswordPage = lazy(() => import("../features/auth/pages/ResetPasswordPage"));

// user pages
export const CartPage = lazy(() => import("../features/cart/pages/CartPage"));
export const CheckoutPage = lazy(() => import("../features/checkout/pages/CheckoutPage"));
export const ProfilePage = lazy(() => import("../features/profile/pages/ProfilePage"));
export const WishlistPage = lazy(() => import("../features/wishlist/pages/WishlistPage"));

// admin pages
export const AdminDashboardPage = lazy(() => import("../features/admin/dashboard/pages/AdminDashboardPage"));
export const AdminContactPage = lazy(
  () => import("../features/admin/contact/pages/AdminContactPage"),
);
export const AdminCartPage = lazy(
  () => import("../features/admin/cart/pages/AdminCartPage"),
);
export const AdminCustomersPage = lazy(
  () => import("../features/admin/customers/pages/AdminCustomersPage"),
);

export const AdminWishlistPage = lazy(
  () => import("../features/admin/wishlist/pages/AdminWishlistPage"),
);

export const AdminProductsPage = lazy(
  () => import("../features/admin/products/pages/AdminProductsPage"),
);

export const AdminCategoriesPage = lazy(
  () => import("../features/admin/categories/pages/AdminCategoriesPage"),
);

export const AdminOrdersPage = lazy(
  () => import("../features/admin/orders/pages/AdminOrdersPage"),
);

// loading component
export const RouteLoading = () => {
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
};

// public routes
const publicRoutes = [
  { path: "/", element: <Navigate to="/Dashboard" replace /> },
  { path: "/Dashboard", element: <DashboardPage /> },
  { path: "/AboutUs", element: <AboutUsPage /> },
  { path: "/Shop", element: <ShopPage /> },
  { path: "/Contact", element: <ContactPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/Login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/Register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password/:token", element: <ResetPasswordPage /> },
];

// protected user routes
const userRoutes = [
  { path: "/cart", element: <CartPage /> },
  { path: "/Checkout", element: <CheckoutPage /> },
  { path: "/Profile", element: <ProfilePage /> },
  { path: "/Wishlist", element: <WishlistPage /> },
];

// protected admin routes
const adminRoutes = [
  { path: "/admin", element: <AdminDashboardPage /> },
  { path: "/admin/*", element: <Navigate to="/admin" replace /> },
  { path: "/admin/contactus", element: <AdminContactPage /> },
  { path: "/admin/cart", element: <AdminCartPage /> },
  { path: "/admin/customers", element: <AdminCustomersPage /> },
  { path: "/admin/wishlist", element: <AdminWishlistPage /> },
  { path: "/admin/products", element: <AdminProductsPage /> },
  { path: "/admin/category", element: <AdminCategoriesPage /> },
  { path: "/admin/orderManagement", element: <AdminOrdersPage /> }
];

// main app routes
export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* public routes */}
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* user protected routes */}
        <Route element={<ProtectedRoute />}>
          {userRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {/* admin protected routes */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          {adminRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
}
