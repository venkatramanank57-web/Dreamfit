// AppRouter.jsx - Updated with faster toast durations
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from 'react-hot-toast'; // ✅ Import Toaster

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


// Placeholders
const ManagerDashboard = () => <div className="p-8 font-black text-slate-800 uppercase italic">Manager Panel Ready</div>;
const StoreKeeperDashboard = () => <div className="p-8 font-black text-slate-800 uppercase italic">Store Keeper Panel Ready</div>;
const CuttingMasterDashboard = () => <div className="p-8 font-black text-slate-800 uppercase italic">Master Work List</div>;
const BankingPlaceholder = ({ title }) => <div className="p-8 font-black text-slate-800 uppercase italic font-sans">{title} Section</div>;
const Work = () => <div className="p-8 font-black text-slate-800 uppercase italic">Work Section</div>;
const Products = () => <div className="p-8 font-black text-slate-800 uppercase italic">Products Section</div>;
const Tailors = () => <div className="p-8 font-black text-slate-800 uppercase italic">Tailors Section</div>;
const Manager = () => <div className="p-8 font-black text-slate-800 uppercase italic">Manager Section</div>;

export default function AppRouter() {
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      {/* ✅ Toaster with faster durations */}
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
          // ⏱️ Default duration for all toasts
          duration: 2000, // 2 seconds default
          
          style: {
            background: '#fff',
            color: '#334155',
            padding: '12px 16px', // Reduced padding
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Lighter shadow
            border: '1px solid #e2e8f0',
            maxWidth: '350px',
          },
          
          // Success toasts - quick!
          success: {
            icon: '✅',
            duration: 1500, // 1.5 seconds only!
            style: {
              borderLeft: '4px solid #10b981',
            },
          },
          
          // Error toasts - a bit longer but still quick
          error: {
            icon: '❌',
            duration: 2000, // 2 seconds
            style: {
              borderLeft: '4px solid #ef4444',
            },
          },
          
          // Loading toasts - also quick
          loading: {
            icon: '⏳',
            duration: 2000, // 2 seconds
          },
        }}
      />

      <Routes>
        {/* --- 🔓 PUBLIC ROUTES --- */}
        <Route path="/" element={<Login />} />

        {/* --- 🛡️ ADMIN ROUTES --- */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="work" element={<Work />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customer />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="add-customer" element={<AddCustomer />} />
          <Route path="tailors" element={<Tailors />} />
          <Route path="manager" element={<Manager />} />
          <Route path="banking/overview" element={<BankingPlaceholder title="Admin Banking Overview" />} />
          <Route path="banking/income" element={<BankingPlaceholder title="Income Tracker" />} />
          <Route path="banking/expense" element={<BankingPlaceholder title="Expense Tracker" />} />
        </Route>

        {/* --- 🛡️ STORE KEEPER ROUTES --- */}
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
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customer />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="add-customer" element={<AddCustomer />} />
          <Route path="tailors" element={<Tailors />} />
          <Route path="manager" element={<Manager />} />
          <Route path="banking/overview" element={<BankingPlaceholder title="Store Keeper Banking Overview" />} />
        </Route>

        {/* --- 🛡️ CUTTING MASTER ROUTES --- */}
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
          <Route path="products" element={<Products />} />
          <Route path="tailors" element={<Tailors />} />
          <Route path="manager" element={<Manager />} />
        </Route>

        {/* --- 🚨 404 REDIRECT --- */}
        <Route 
          path="*" 
          element={
            !isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate 
                to={
                  user?.role === "ADMIN" ? "/admin/dashboard" :
                  user?.role === "MANAGER" ? "/manager/dashboard" :
                  user?.role === "STORE_KEEPER" ? "/storekeeper/dashboard" :
                  "/cuttingmaster/dashboard"
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