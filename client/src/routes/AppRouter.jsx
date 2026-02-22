// AppRouter.jsx - Complete with all routes and product details
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

// Layout & Protected Route
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Auth Pages
import Login from "../Pages/auth/Login";

// Page Components
import AdminDashboard from "../Pages/admin/AdminDashboard";
import Orders from "../Pages/admin/Orders";
import Customer from "../Pages/common/Customers";
import AddCustomer from "../Pages/common/AddCustomer";
import CustomerDetails from "../Pages/common/CustomerDetails";
import Staff from "../Pages/admin/Staff";
import StaffDetails from "../Pages/admin/StaffDetails";
import AddStaff from "../Pages/common/AddStaff";

// Product Management Components
import Products from "../Pages/admin/Products";
import FabricDetail from "../Pages/admin/FabricDetail";
import CategoryDetail from "../Pages/admin/CategoryDetail";
import ItemDetail from "../Pages/admin/ItemDetail";
import EditFabric from "../Pages/admin/EditFabric";

// Measurement Components
import Measurements from "../Pages/admin/Measurements";
import NewTemplate from "../Pages/admin/NewTemplate";
import TemplateDetails from "../Pages/admin/TemplateDetails";
import EditTemplate from "../Pages/admin/EditTemplate";

// Placeholders
const ManagerDashboard = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Manager Panel Ready
  </div>
);
const StoreKeeperDashboard = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Store Keeper Panel Ready
  </div>
);
const CuttingMasterDashboard = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Master Work List
  </div>
);
const BankingPlaceholder = ({ title }) => (
  <div className="p-8 font-black text-slate-800 uppercase italic font-sans">
    {title} Section
  </div>
);
const Work = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Work Section
  </div>
);
const Tailors = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Tailors Section
  </div>
);
const ShopKeeper = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Shop Keeper Section
  </div>
);

export default function AppRouter() {
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      {/* Toaster with fast durations */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          right: 20,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 2000,
          style: {
            background: "#fff",
            color: "#334155",
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #e2e8f0",
            maxWidth: "350px",
          },
          success: {
            icon: "✅",
            duration: 1500,
            style: {
              borderLeft: "4px solid #10b981",
            },
          },
          error: {
            icon: "❌",
            duration: 2000,
            style: {
              borderLeft: "4px solid #ef4444",
            },
          },
          loading: {
            icon: "⏳",
            duration: 2000,
          },
        }}
      />

      <Routes>
        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />

        {/* 🛡️ ADMIN ROUTES (Full Access) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Orders */}
          <Route path="orders" element={<Orders />} />
          
          {/* Work */}
          <Route path="work" element={<Work />} />
          
          {/* Measurement - Admin gets full access */}
          <Route path="measurements" element={<Measurements />} />
          <Route path="measurements/new" element={<NewTemplate />} />
          <Route path="measurements/:id" element={<TemplateDetails />} />
          <Route path="measurements/edit/:id" element={<EditTemplate />} />
          
          {/* Products Management */}
          <Route path="products" element={<Products />} />
          
          {/* Product Detail Pages */}
          <Route path="fabrics/:id" element={<FabricDetail />} />
          <Route path="categories/:id" element={<CategoryDetail />} />
          <Route path="items/:id" element={<ItemDetail />} />
          <Route path="fabrics/edit/:id" element={<EditFabric />} />
          
          {/* Customers */}
          <Route path="customers" element={<Customer />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="add-customer" element={<AddCustomer />} />
          
          {/* Staff Management */}
          <Route path="staff" element={<Staff />} />
          <Route path="staff/:id" element={<StaffDetails />} />
          <Route path="add-staff" element={<AddStaff />} />
          
          {/* Shop Keeper */}
          <Route path="shopkeeper" element={<ShopKeeper />} />
          
          {/* Tailors */}
          <Route path="tailors" element={<Tailors />} />
          
          {/* Banking */}
          <Route path="banking/overview" element={<BankingPlaceholder title="Admin Banking Overview" />} />
          <Route path="banking/income" element={<BankingPlaceholder title="Income Tracker" />} />
          <Route path="banking/expense" element={<BankingPlaceholder title="Expense Tracker" />} />
        </Route>

        {/* 🛡️ STORE KEEPER ROUTES */}
        <Route
          path="/storekeeper/*"
          element={
            <ProtectedRoute allowedRoles={["STORE_KEEPER"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StoreKeeperDashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="work" element={<Work />} />
          
          {/* ✅ Measurement - Store Keeper access (ADD THESE) */}
          <Route path="measurements" element={<Measurements />} />
          <Route path="measurements/new" element={<NewTemplate />} />
          <Route path="measurements/:id" element={<TemplateDetails />} />
          <Route path="measurements/edit/:id" element={<EditTemplate />} />
          
          <Route path="products" element={<Products />} />
          <Route path="fabrics/:id" element={<FabricDetail />} />
          <Route path="categories/:id" element={<CategoryDetail />} />
          <Route path="items/:id" element={<ItemDetail />} />
          <Route path="customers" element={<Customer />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="add-customer" element={<AddCustomer />} />
          <Route path="shopkeeper" element={<ShopKeeper />} />
          <Route path="tailors" element={<Tailors />} />
          <Route path="banking/overview" element={<BankingPlaceholder title="Store Keeper Banking Overview" />} />
        </Route>

        {/* 🛡️ CUTTING MASTER ROUTES (Restricted) */}
        <Route
          path="/cuttingmaster/*"
          element={
            <ProtectedRoute allowedRoles={["CUTTING_MASTER"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CuttingMasterDashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="work" element={<Work />} />
          
          {/* ✅ Measurement - Cutting Master access (ADD THESE) */}
          <Route path="measurements" element={<Measurements />} />
          <Route path="measurements/:id" element={<TemplateDetails />} />
          {/* Note: Cutting Master can view but not create/edit */}
          
          <Route path="products" element={<Products />} />
          <Route path="tailors" element={<Tailors />} />
        </Route>

        {/* 🚨 404 REDIRECT */}
        <Route
          path="*"
          element={
            !isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate
                to={
                  user?.role === "ADMIN"
                    ? "/admin/dashboard"
                    : user?.role === "STORE_KEEPER"
                      ? "/storekeeper/dashboard"
                      : "/cuttingmaster/dashboard"
                }
                replace
              />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}