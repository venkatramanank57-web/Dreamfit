import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingCart, Scissors, Users, Landmark, 
  Package, Settings, Bell, Search, ChevronDown, 
  ChevronRight, LogOut, UserCircle, Briefcase, Store, Ruler
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";

export default function MainLayout() {
  const { user } = useSelector((state) => state.auth);
  const [bankingOpen, setBankingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Role verification
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  
  // ✅ Updated Permissions:
  // Admin: Everything
  // Store Keeper: Banking, Customers, Products, Shop Keeper
  // Cutting Master: Only Dashboard, Work, Tailors (NO Orders)

  // Banking access - Admin AND Store Keeper
  const canViewBanking = isAdmin || isStoreKeeper;

  // Customers access - Admin and Store Keeper only
  const canViewCustomers = isAdmin || isStoreKeeper;

  // Staff access (formerly Manager) - Admin only
  const canViewStaff = isAdmin;

  // Shop Keeper access - Admin and Store Keeper
  const canViewShopKeeper = isAdmin || isStoreKeeper;

  // Products access - Admin and Store Keeper only
  const canViewProducts = isAdmin || isStoreKeeper;

  // Orders access - Admin and Store Keeper only (NOT Cutting Master)
  const canViewOrders = isAdmin || isStoreKeeper;

  // Measurement access - Admin, Store Keeper, and Cutting Master (NEW)
  const canViewMeasurement = isAdmin || isStoreKeeper || isCuttingMaster;

  // Current active link style check
  const isActive = (path) => location.pathname.includes(path);

  // Role path for navigation
  const rolePath = user?.role === "ADMIN" ? "admin" : 
                   user?.role === "STORE_KEEPER" ? "storekeeper" : 
                   "cuttingmaster";

  // Navigation items configuration based on role
  const getNavigationItems = () => {
    const items = [
      // Dashboard - Everyone can see
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: `/${rolePath}/dashboard`, show: true },
      
      // Orders - Admin and Store Keeper only (NOT Cutting Master)
      { id: 'orders', icon: ShoppingCart, label: 'Orders', path: `/${rolePath}/orders`, show: canViewOrders },
      
      // Work - Everyone can see
      { id: 'work', icon: Briefcase, label: 'Works', path: `/${rolePath}/work`, show: true },
      
      // Measurement - Admin, Store Keeper, and Cutting Master (NEW - Simple Link, No Dropdown)
      { id: 'measurement', icon: Ruler, label: 'Measurement', path: `/${rolePath}/measurement`, show: canViewMeasurement },
      
      // Products - Admin and Store Keeper only
      { id: 'products', icon: Package, label: 'Products', path: `/${rolePath}/products`, show: canViewProducts },
      
      // Customers - Admin and Store Keeper only
      { id: 'customers', icon: Users, label: 'Customers', path: `/${rolePath}/customers`, show: canViewCustomers },
      
      // Shop Keeper - Admin and Store Keeper
      { id: 'shopkeeper', icon: Store, label: 'Shop Keeper', path: `/${rolePath}/shopkeeper`, show: canViewShopKeeper },
      
      // Banking - Admin and Store Keeper both can see (Dropdown)
      { id: 'banking', icon: Landmark, label: 'Banking', path: '#', show: canViewBanking, isDropdown: true },
      
      // Tailors Panels - Everyone can see (including Cutting Master)
      { id: 'tailors', icon: Scissors, label: 'Tailors Panels', path: '/tailors', show: true },
      
      // Staff - Admin only
      { id: 'staff', icon: UserCircle, label: 'Staffs', path: `/${rolePath}/staff`, show: canViewStaff },
    ];
    
    return items.filter(item => item.show);
  };

  // Filter navigation items based on search query
  const getFilteredNavItems = () => {
    const items = getNavigationItems();
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase().trim();
    return items.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  };

  const filteredNavItems = getFilteredNavItems();
  const navigationItems = getNavigationItems();
  const hasNoResults = filteredNavItems.length === 0 && searchQuery.trim() !== '';

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans">
      
      {/* --- LEFT SIDEBAR (DARK THEME) --- */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col shadow-2xl z-20">
        
        {/* ROW 1: BRAND NAME */}
        <div className="p-6 border-b border-slate-800 bg-[#0F172A]">
          <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase italic">
            Dreamfit <span className="text-blue-500 font-extrabold italic">Couture</span>
          </h2>
        </div>

        {/* ROW 2: USER PROFILE & SETTINGS & NOTIFICATIONS */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-800 bg-[#1e293b]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg border border-blue-400/20">
              <UserCircle size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white truncate w-24 leading-none mb-1">{user?.name || "User"}</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button title="Settings" className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">
              <Settings size={18} />
            </button>
            <button title="Notifications" className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* ROW 3: SEARCH FIELD WITH ICON AND REAL-TIME FILTERING */}
        <div className="px-4 py-5">
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search menu... (type to filter)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          {/* Search stats */}
          {searchQuery && (
            <div className="mt-2 text-xs text-slate-500 px-2">
              Found {filteredNavItems.length} of {navigationItems.length} items
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS WITH FILTERING */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2 custom-scrollbar-hidden">
          
          {hasNoResults ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Search size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm font-medium">No matching menu items</p>
              <p className="text-slate-600 text-xs mt-1">Try different keywords</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-4 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredNavItems.map((item) => (
              <div key={item.id}>
                {item.isDropdown ? (
                  // Banking Dropdown - Admin and Store Keeper
                  <div>
                    <button 
                      onClick={() => setBankingOpen(!bankingOpen)}
                      className={`w-full nav-link flex justify-between ${bankingOpen ? 'text-white' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={19} /> <span>{item.label}</span>
                      </div>
                      {bankingOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                    </button>
                    
                    {bankingOpen && (
                      <div className="ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1">
                        <Link to={`/${rolePath}/banking/overview`} className="block py-2 text-sm text-slate-500 hover:text-blue-400 transition-colors font-medium">Overview</Link>
                        
                        {/* Admin gets full banking access */}
                        {isAdmin && (
                          <>
                            <Link to={`/${rolePath}/banking/income`} className="block py-2 text-sm text-slate-500 hover:text-blue-400 transition-colors font-medium">Income</Link>
                            <Link to={`/${rolePath}/banking/expense`} className="block py-2 text-sm text-slate-500 hover:text-blue-400 transition-colors font-medium">Expenses</Link>
                          </>
                        )}
                        
                        {/* Store Keeper gets limited banking */}
                        {isStoreKeeper && (
                          <Link to={`/${rolePath}/banking/inventory`} className="block py-2 text-sm text-slate-500 hover:text-blue-400 transition-colors font-medium">Inventory</Link>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular Navigation Links (including Measurement)
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive(item.id) ? 'active-link' : ''}`}
                  >
                    <item.icon size={19} /> <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))
          )}
        </nav>

        {/* SIGN OUT AT BOTTOM */}
        <div className="p-4 mt-auto border-t border-slate-800 bg-[#0F172A]">
           <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-500 hover:text-red-400 w-full p-3 rounded-xl transition-all hover:bg-red-400/10 group font-bold"
           >
             <LogOut size={19} className="group-hover:translate-x-1 transition-transform" /> 
             <span className="text-sm">Log Out System</span>
           </button>
        </div>
      </aside>

      {/* --- RIGHT SIDE CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
             <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
               {user?.role?.replace('_', ' ')} Control Panel
             </h2>
           </div>
           <div className="flex items-center gap-4">
             <div className="text-[11px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 uppercase tracking-tighter">
               {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
             </div>
           </div>
        </header>
        
        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet /> 
        </div>
      </main>

      {/* COMPONENT STYLES */}
      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          transition: all 0.2s ease-in-out;
          color: #94a3b8;
          font-weight: 500;
          font-size: 0.95rem;
        }
        .nav-link:hover {
          color: #ffffff;
          background-color: #1e293b;
        }
        .active-link {
          background-color: #3b82f6 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}