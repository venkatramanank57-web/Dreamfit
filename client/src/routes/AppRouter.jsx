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
import Orders from "../Pages/admin/order/Orders";
import Customer from "../Pages/admin/Customers/Customers";
import AddCustomer from "../Pages/admin/Customers/AddCustomer";
import CustomerDetails from "../Pages/admin/Customers/CustomerDetails";
import Staff from "../Pages/admin/staff/Staff";
import StaffDetails from "../Pages/admin/staff/StaffDetails";
import AddStaff from "../Pages/admin/staff/AddStaff";

// Product Management Components
import Products from "../Pages/admin/Products/Products";
import FabricDetail from "../Pages/admin/Products/FabricDetail";
import CategoryDetail from "../Pages/admin/Products/CategoryDetail";
import ItemDetail from "../Pages/admin/Products/ItemDetail";
import EditFabric from "../Pages/admin/Products/EditFabric";

// Measurement Components
import Measurements from "../Pages/admin/Measurements/Measurements";
import NewTemplate from "../Pages/admin/Measurements/NewTemplate";
import TemplateDetails from "../Pages/admin/Measurements/TemplateDetails";
import EditTemplate from "../Pages/admin/Measurements/EditTemplate";

// ✅ ORDER MANAGEMENT COMPONENTS
import NewOrder from "../Pages/admin/order/NewOrder";
import OrderDetails from "../Pages/admin/order/OrderDetails";
import GarmentDetails from "../Pages/admin/garment/GarmentDetails";
import EditOrder from "../Pages/admin/order/EditOrder";
import EditGarment from "../Pages/admin/garment/EditGarment"; 

// ✅ WORK MANAGEMENT COMPONENTS
import WorksPage from "../Pages/works/WorksPage";
import WorkDetailsPage from "../Pages/works/WorkDetailsPage";
import CuttingMasterWorks from "../Pages/works/CuttingMasterWorks";

// ✅ TAILOR MANAGEMENT COMPONENTS
import Tailors from "../Pages/admin/tailor/Tailors";
import AddTailor from "../Pages/admin/tailor/AddTailor";
import TailorDetails from "../Pages/admin/tailor/TailorDetails";
import EditTailor from "../Pages/admin/tailor/EditTailor";

// ✅ CUTTING MASTER COMPONENTS
import CuttingMasters from "../Pages/admin/cuttingMaster/CuttingMasters";
import AddCuttingMaster from "../Pages/admin/cuttingMaster/AddCuttingMaster";
import CuttingMasterDetails from "../Pages/admin/cuttingMaster/CuttingMasterDetails";
import EditCuttingMaster from "../Pages/admin/cuttingMaster/EditCuttingMaster";

// ✅ STORE KEEPER COMPONENTS
import StoreKeepers from "../Pages/admin/storeKeeper/StoreKeepers";
import AddStoreKeeper from "../Pages/admin/storeKeeper/AddStoreKeeper";
import StoreKeeperDetails from "../Pages/admin/storeKeeper/StoreKeeperDetails";
import EditStoreKeeper from "../Pages/admin/storeKeeper/EditStoreKeeper";

// ✅ BANKING MODULE COMPONENTS
import BankingOverview from "../Pages/Banking/BankingOverview";
import IncomePage from "../Pages/Banking/IncomePage";
import ExpensePage from "../Pages/Banking/ExpensePage";

// ✅ NOTIFICATION COMPONENTS
import NotificationsPage from "../Pages/notifications/NotificationsPage";

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

const Work = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Work Section
  </div>
);

const ShopKeeper = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Shop Keeper Section
  </div>
);

const ReportsPlaceholder = ({ title }) => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    {title} - Coming Soon
  </div>
);

const Settings = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Settings - Coming Soon
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
          
          {/* Orders Management */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="orders/edit/:id" element={<EditOrder />} />
          
          {/* Garment Management */}
          <Route path="garments/:id" element={<GarmentDetails />} />
          <Route path="garments/edit/:id" element={<EditGarment />} />
          
          {/* ✅ WORK MANAGEMENT - FULL ACCESS */}
          <Route path="works" element={<WorksPage />} />
          <Route path="works/:id" element={<WorkDetailsPage />} />
          
          {/* Tailors Management */}
          <Route path="tailors" element={<Tailors />} />
          <Route path="tailors/add" element={<AddTailor />} />
          <Route path="tailors/:id" element={<TailorDetails />} />
          <Route path="tailors/edit/:id" element={<EditTailor />} />
          
          {/* Cutting Masters Management */}
          <Route path="cutting-masters" element={<CuttingMasters />} />
          <Route path="cutting-masters/add" element={<AddCuttingMaster />} />
          <Route path="cutting-masters/:id" element={<CuttingMasterDetails />} />
          <Route path="cutting-masters/edit/:id" element={<EditCuttingMaster />} />
          
          {/* Store Keepers Management */}
          <Route path="store-keepers" element={<StoreKeepers />} />
          <Route path="store-keepers/add" element={<AddStoreKeeper />} />
          <Route path="store-keepers/:id" element={<StoreKeeperDetails />} />
          <Route path="store-keepers/edit/:id" element={<EditStoreKeeper />} />
          
          {/* Work Section (Legacy) */}
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
          
          {/* ✅ BANKING MODULE */}
          <Route path="banking/overview" element={<BankingOverview />} />
          <Route path="banking/income" element={<IncomePage />} />
          <Route path="banking/expense" element={<ExpensePage />} />
          
          {/* Reports */}
          <Route path="reports/sales" element={<ReportsPlaceholder title="Sales Report" />} />
          <Route path="reports/production" element={<ReportsPlaceholder title="Production Report" />} />
          <Route path="reports/staff-performance" element={<ReportsPlaceholder title="Staff Performance" />} />
          <Route path="reports/financial" element={<ReportsPlaceholder title="Financial Report" />} />
          <Route path="reports/customer-analytics" element={<ReportsPlaceholder title="Customer Analytics" />} />
          
          {/* Settings */}
          <Route path="settings" element={<Settings />} />
          
          {/* Notifications */}
          <Route path="notifications" element={<NotificationsPage />} />
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
          
          {/* Orders Management */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="orders/edit/:id" element={<EditOrder />} />
          
          {/* Garment Management */}
          <Route path="garments/:id" element={<GarmentDetails />} />
          <Route path="garments/edit/:id" element={<EditGarment />} />
          
          {/* ✅ WORK MANAGEMENT - FULL ACCESS (VIEW ONLY) */}
          <Route path="works" element={<WorksPage />} />
          <Route path="works/:id" element={<WorkDetailsPage />} />
          
          {/* Tailors Management */}
          <Route path="tailors" element={<Tailors />} />
          <Route path="tailors/add" element={<AddTailor />} />
          <Route path="tailors/:id" element={<TailorDetails />} />
          <Route path="tailors/edit/:id" element={<EditTailor />} />
          
          {/* Work Section (Legacy) */}
          <Route path="work" element={<Work />} />
          
          {/* Measurement - Store Keeper access */}
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
          
          {/* ✅ BANKING MODULE */}
          <Route path="banking/overview" element={<BankingOverview />} />
          <Route path="banking/income" element={<IncomePage />} />
          <Route path="banking/expense" element={<ExpensePage />} />
          
          {/* Reports - Limited access */}
          <Route path="reports/sales" element={<ReportsPlaceholder title="Sales Report" />} />
          <Route path="reports/inventory" element={<ReportsPlaceholder title="Inventory Report" />} />
          <Route path="reports/production" element={<ReportsPlaceholder title="Production Report" />} />
          
          {/* Notifications */}
          <Route path="notifications" element={<NotificationsPage />} />
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
          
          {/* Orders - View only */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          
          {/* Garment Details - View only */}
          <Route path="garments/:id" element={<GarmentDetails />} />
          
          {/* ✅ WORK MANAGEMENT - CUTTING MASTER SPECIFIC */}
          <Route path="works" element={<CuttingMasterWorks />} />
          <Route path="works/:id" element={<WorkDetailsPage />} />
          
          {/* Tailors - View only */}
          <Route path="tailors" element={<Tailors />} />
          <Route path="tailors/:id" element={<TailorDetails />} />
          
          {/* Work Section (Legacy) */}
          <Route path="work" element={<Work />} />
          
          {/* Measurement - View only */}
          <Route path="measurements" element={<Measurements />} />
          <Route path="measurements/:id" element={<TemplateDetails />} />
          
          <Route path="products" element={<Products />} />
          
          {/* ❌ NO BANKING ACCESS FOR CUTTING MASTER */}
          
          {/* Notifications */}
          <Route path="notifications" element={<NotificationsPage />} />
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