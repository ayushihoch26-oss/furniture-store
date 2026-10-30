import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./page/ProtectedRoute";
import ThemeModeProvider from "./theme/ThemeModeProvider";

import Dashboard from "./page/Dashboard";
import AboutUs from "./page/Aboutus";
import Shop from "./page/Shop";
import Contact from "./page/Contactus";
import Checkout from "./page/checkout";
import Profile from "./page/profile";
import CartPage from "./page/cart";
import Login from "./page/Login";
import Register from "./page/Register";
import Wishlist from "./page/Wishlist";
import ForgotPassword from "./page/Forgotpassword";
import ResetPassword from "./page/resetpassword";

//admin router
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminOrderManagement from "./admin/pages/OrderManagament";
import AdminCustomers from "./admin/pages/Customer";
import AdminCart from "./admin/pages/AdminCart";
import AdminProducts from "./admin/pages/Product";

import AdminContact from "./admin/pages/Contactus";
import AdminRole from "./admin/pages/AdminRole";
import AdminAuthority from "./admin/pages/Authority";
import AdminWishlist from "./admin/pages/AdminWishlist";
import AdminCategories from "./admin/pages/Categories";
import AdminInvoice from "./admin/pages/AdminInvoice";

function App() {
  return (
    <BrowserRouter>
      {/* dark / light theme for the whole app (must be inside BrowserRouter) */}
      <ThemeModeProvider>
        <Routes>
          {/* ---------- Public ---------- */}
          <Route path="/" element={<Navigate to="/Dashboard" replace />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/Shop" element={<Shop />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ---------- Logged-in users (customer or admin) ---------- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/Checkout" element={<Checkout />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Wishlist" element={<Wishlist />} />
          </Route>

          {/* ---------- Admin only ---------- */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/admin/orderManagement"
              element={<AdminOrderManagement />}
            />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/cart" element={<AdminCart />} />
            <Route path="/admin/products" element={<AdminProducts />} />

            <Route path="/admin/contactus" element={<AdminContact />} />
            <Route path="/admin/roles" element={<AdminRole />} />
            <Route path="/admin/authority" element={<AdminAuthority />} />
            <Route path="/admin/wishlist" element={<AdminWishlist />} />
            <Route path="/admin/category" element={<AdminCategories />} />
            <Route path="/admin/invoice" element={<AdminInvoice />} />
          </Route>
        </Routes>
      </ThemeModeProvider>
    </BrowserRouter>
  );
}

export default App;
