import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../features/auth/authSlice";
import { loginRequest } from "../../features/auth/authAPI";
import showToast from "../../utils/toast";
import logo from "../../assets/logo.png";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      showToast.error("Please enter both email and password");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error("Please enter a valid email address");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      showToast.error("Password must be at least 6 characters");
      return;
    }

    let toastId; // To store loading toast ID

    try {
      setLoading(true);
      dispatch(loginStart());

      // Show loading toast
      toastId = showToast.loading("Logging in...");

      // Backend API Call
      const data = await loginRequest(email, password);

      console.log("✅ Login successful:", data); // Debug log

      // Dismiss loading toast
      showToast.dismiss(toastId);

      // Ensure data has the correct structure
      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // If remember me is checked, we can set a longer expiry (handled by backend usually)
      if (rememberMe) {
        // You can implement remember me logic here if needed
        console.log("Remember me enabled");
      }

      // Redux-la data save pannuvom
      dispatch(loginSuccess(data));

      // Show success message
      showToast.success(`Welcome back, ${data.user.name || "User"}! 🎉`);

      // ROLE BASED REDIRECTION LOGIC 🚀
      const userRole = data.user.role;

      if (userRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (userRole === "STORE_KEEPER") {
        navigate("/storekeeper/dashboard");
      } else if (userRole === "CUTTING_MASTER") {
        navigate("/cuttingmaster/dashboard");
      } else {
        showToast.error("Unauthorized Role! ❌");
        navigate("/");
      }
    } catch (err) {
      // Dismiss loading toast if it exists
      if (toastId) showToast.dismiss(toastId);

      const errorMessage =
        err.response?.data?.message || err.message || "Invalid credentials ❌";
      dispatch(loginFailure(errorMessage));
      showToast.error(errorMessage);

      console.error("❌ Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo accounts for quick testing
  const fillDemoAccount = (role) => {
    if (role === "admin") {
      setEmail("admin@dreamfit.com");
      setPassword("123456");
    } else if (role === "store") {
      setEmail("store@dreamfit.com");
      setPassword("123456");
    } else if (role === "cutting") {
      setEmail("cutting@dreamfit.com");
      setPassword("123456");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex bg-[#f3bacd] items-center justify-center p-12 relative overflow-hidden">
        {/* Background Watermark Logos */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <img
            src={logo}
            className="absolute top-[-5%] left-[-10%] w-64 rotate-12"
            alt="Dreamfit Couture floral watermark logo"
          />
          <img
            src={logo}
            className="absolute top-[20%] right-[-5%] w-40 -rotate-12"
            alt="Dreamfit Couture floral watermark logo"
          />
          <img
            src={logo}
            className="absolute bottom-[10%] left-[-5%] w-48 rotate-45"
            alt="Dreamfit Couture floral watermark logo"
          />
          <img
            src={logo}
            className="absolute bottom-[-10%] right-[10%] w-72 -rotate-12"
            alt="Dreamfit Couture floral watermark logo"
          />
          <img
            src={logo}
            className="absolute top-[40%] left-[30%] w-32 opacity-50"
            alt="Dreamfit Couture floral watermark logo"
          />
        </div>

        <div className="max-w-md relative z-10 text-center flex flex-col items-center">
          {/* Main Logo Image (Bigger Now) */}
          <div className="mb-6 drop-shadow-xl transform hover:scale-105 transition-transform duration-300">
            <img
              src={logo}
              alt="Dreamfit Couture official logo"
              className="w-60 h-auto"
            />
          </div>

          {/* Brand Name & Tagline */}
          <div className="mb-6">
            <h2 className="font-['Playfair_Display'] text-5xl lg:text-6xl text-[#d81b60] tracking-wide whitespace-nowrap">
              Dreamfit Couture
            </h2>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-[1.5px] w-12 bg-[#d81b60] opacity-50"></div>
              <span className="text-[#d81b60] text-sm font-medium italic tracking-widest uppercase">
                Style Your Imagination
              </span>
              <div className="h-[1.5px] w-12 bg-[#d81b60] opacity-50"></div>
            </div>
          </div>

          {/* Premium Badge */}
          <div className="bg-[#d81b60] text-white px-8 py-4 rounded-2xl shadow-lg mb-10 transform -rotate-1 w-72 text-center">
            <p className="text-lg italic border-b border-pink-300/30 pb-1 mb-1 font-['Great_Vibes']">
              Premium
            </p>
            <p className="text-xs font-black uppercase tracking-[0.2em] font-['Montserrat']">
              Boutique & Tailoring
            </p>
          </div>

          {/* Stats Section */}
          <div className="space-y-2 mt-4">
            <p className="text-3xl font-bold text-[#d81b60] drop-shadow-sm">
              500+ Happy Customers
            </p>
            <p className="text-3xl font-bold text-[#d81b60] drop-shadow-sm">
              1K+ Orders
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Welcome Back! 👋
            </h1>
            <p className="text-slate-500 font-medium">
              Access your dashboard using your credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MailIcon
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LockIcon
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="ml-2 text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline text-sm"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-8">
            <p className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider text-center">
              Quick Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("admin")}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-blue-200"
                disabled={loading}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("store")}
                className="bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-green-200"
                disabled={loading}
              >
                Store
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("cutting")}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-orange-200"
                disabled={loading}
              >
                Cutting
              </button>
            </div>
          </div>

          {/* Demo Accounts Info */}
          <div className="mt-6 text-xs">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-400 font-black uppercase tracking-wider mb-2 text-[10px]">
                Demo Credentials
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-black text-blue-600">Admin</span>
                  <span className="font-mono">admin@dreamfit.com</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-black text-green-600">
                    Store Keeper
                  </span>
                  <span className="font-mono">store@dreamfit.com</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-black text-orange-600">
                    Cutting Master
                  </span>
                  <span className="font-mono">cutting@dreamfit.com</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-black">Password</span>
                    <span className="font-mono">123456</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4 font-medium">
            &copy; {new Date().getFullYear()} DreamFit ERP. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}