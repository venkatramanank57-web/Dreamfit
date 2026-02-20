// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  // Debug logs
  console.log("🔐 ProtectedRoute - User:", user);
  console.log("🔐 ProtectedRoute - Token:", token);
  console.log("🔐 ProtectedRoute - Allowed Roles:", allowedRoles);
  console.log("🔐 ProtectedRoute - Is Authenticated:", isAuthenticated);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🔐 Not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user?.role)) {
    console.log(`🔐 Role ${user?.role} not allowed. Allowed: ${allowedRoles}`);
    
    const redirectPath = 
      user?.role === "ADMIN" ? "/admin/dashboard" :
      user?.role === "MANAGER" ? "/manager/dashboard" :
      user?.role === "STORE_KEEPER" ? "/storekeeper/dashboard" :
      "/cuttingmaster/dashboard";
    
    console.log("🔐 Redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("🔐 Access granted!");
  return children;
}