import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingCart, Scissors, Users, Landmark, 
  Package, Settings, Bell, Search, ChevronDown, 
  ChevronRight, LogOut, UserCircle, Briefcase, Store, Ruler, X,
  Calendar, Clock, CheckSquare, BarChart3, FileText, Truck,
  HelpCircle, BookOpen, Award, Gift, CreditCard, Shield,
  Flag, Target, TrendingUp, UserPlus, UserCheck, UserX,
  HardHat, ClipboardList, Wallet, IndianRupee, Download, Filter,
  PieChart, Activity, DollarSign, Receipt, Banknote, PiggyBank
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import NotificationBell from "../common/NotificationBell";

export default function MainLayout() {
  const { user } = useSelector((state) => state.auth);
  const [bankingOpen, setBankingOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [cuttingMasterOpen, setCuttingMasterOpen] = useState(false);
  const [storeKeeperOpen, setStoreKeeperOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      navigate("/");
    }
  };

  // Role verification
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";
  
  // ✅ UPDATED PERMISSIONS:
  // Admin: Everything
  // Store Keeper: Everything EXCEPT Staff & Settings (including FULL Banking access)
  // Cutting Master: Dashboard, Works, Tailors ONLY (NO Measurements)

  // ✅ Banking access - Admin AND Store Keeper (FULL access for Store Keeper)
  const canViewBanking = isAdmin || isStoreKeeper;

  // Customers access - Admin and Store Keeper only
  const canViewCustomers = isAdmin || isStoreKeeper;

  // Staff access - Admin only
  const canViewStaff = isAdmin;

  // Shop Keeper access - Admin and Store Keeper
  const canViewShopKeeper = isAdmin || isStoreKeeper;

  // Products access - Admin and Store Keeper only
  const canViewProducts = isAdmin || isStoreKeeper;

  // Orders access - Admin and Store Keeper only (NOT Cutting Master)
  const canViewOrders = isAdmin || isStoreKeeper;

  // Works access - Everyone can see
  const canViewWorks = true;

  // Measurement access - Admin and Store Keeper ONLY (NO Cutting Master)
  const canViewMeasurement = isAdmin || isStoreKeeper;

  // Tailors access - Everyone can see
  const canViewTailors = true;

  // Reports access - Admin and Store Keeper
  const canViewReports = isAdmin || isStoreKeeper;

  // Settings access - Admin only
  const canViewSettings = isAdmin;

  // Cutting Master Management - Admin only
  const canViewCuttingMasters = isAdmin;

  // Store Keeper Management - Admin only
  const canViewStoreKeepers = isAdmin;

  // Current active link style check
  const isActive = (path) => {
    if (path === '#') return false;
    return location.pathname.includes(path) || 
           (path.includes('banking') && location.pathname.includes('banking')) ||
           (path.includes('reports') && location.pathname.includes('reports')) ||
           (path.includes('cutting-masters') && location.pathname.includes('cutting-masters')) ||
           (path.includes('store-keepers') && location.pathname.includes('store-keepers'));
  };

  // Role path for navigation
  const rolePath = user?.role === "ADMIN" ? "admin" : 
                   user?.role === "STORE_KEEPER" ? "storekeeper" : 
                   "cuttingmaster";

  // ✅ COMPLETE BANKING SUB-ITEMS - FULL access for Store Keeper
  const bankingItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Wallet, 
      path: `/${rolePath}/banking/overview`,
      description: 'Banking dashboard with summary'
    },
    { 
      id: 'income', 
      label: 'Income', 
      icon: TrendingUp, 
      path: `/${rolePath}/banking/income`,
      description: 'Track all income transactions'
    },
    { 
      id: 'expense', 
      label: 'Expenses', 
      icon: Receipt, 
      path: `/${rolePath}/banking/expense`,
      description: 'Manage expenses'
    },
    // { 
    //   id: 'transactions', 
    //   label: 'All Transactions', 
    //   icon: FileText, 
    //   path: `/${rolePath}/banking/transactions`,
    //   description: 'View all financial transactions'
    // },
    // { 
    //   id: 'hand-cash', 
    //   label: 'Hand Cash', 
    //   icon: Banknote, 
    //   path: `/${rolePath}/banking/hand-cash`,
    //   description: 'Physical cash management'
    // },
    // { 
    //   id: 'bank', 
    //   label: 'Bank Account', 
    //   icon: Landmark, 
    //   path: `/${rolePath}/banking/bank`,
    //   description: 'Bank transactions'
    // },
    // { 
    //   id: 'reports', 
    //   label: 'Financial Reports', 
    //   icon: PieChart, 
    //   path: `/${rolePath}/banking/reports`,
    //   description: 'Financial analytics'
    // }
  ];

  // Reports sub-items - Store Keeper gets limited reports
  const reportsItems = [
    { id: 'sales', label: 'Sales Report', icon: TrendingUp, path: `/${rolePath}/reports/sales` },
    { id: 'production', label: 'Production Report', icon: Briefcase, path: `/${rolePath}/reports/production` },
    { id: 'financial', label: 'Financial Report', icon: Landmark, path: `/${rolePath}/reports/financial` },
    ...(isAdmin ? [
      { id: 'staff-performance', label: 'Staff Performance', icon: Award, path: `/${rolePath}/reports/staff-performance` },
      { id: 'customer-analytics', label: 'Customer Analytics', icon: Users, path: `/${rolePath}/reports/customer-analytics` },
    ] : []),
    ...(isStoreKeeper ? [
      { id: 'inventory-report', label: 'Inventory Report', icon: Package, path: `/${rolePath}/reports/inventory` },
      { id: 'daily-sales', label: 'Daily Sales', icon: DollarSign, path: `/${rolePath}/reports/daily-sales` },
    ] : []),
  ];

  // Navigation items configuration based on role
  const getNavigationItems = () => {
    const items = [
      // Dashboard - Everyone can see
      { 
        id: 'dashboard', 
        icon: LayoutDashboard, 
        label: 'Dashboard', 
        path: `/${rolePath}/dashboard`, 
        show: true,
        description: 'Overview and statistics'
      },
      
      // Orders - Admin and Store Keeper only (NOT Cutting Master)
      { 
        id: 'orders', 
        icon: ShoppingCart, 
        label: 'Orders', 
        path: `/${rolePath}/orders`, 
        show: canViewOrders,
        description: 'Manage customer orders'
      },
      
      // Works - Everyone can see
      { 
        id: 'works', 
        icon: Briefcase, 
        label: 'Works', 
        path: `/${rolePath}/works`, 
        show: canViewWorks,
        description: 'Production work management'
      },
      
      // Tailors - Everyone can see
      { 
        id: 'tailors', 
        icon: Scissors, 
        label: 'Tailors', 
        path: `/${rolePath}/tailors`, 
        show: canViewTailors,
        description: 'Manage tailor profiles and assignments'
      },
      
      // Cutting Masters - Admin only
      { 
        id: 'cutting-masters', 
        icon: HardHat, 
        label: 'Cutting Masters', 
        path: `/${rolePath}/cutting-masters`, 
        show: canViewCuttingMasters,
        description: 'Manage cutting masters'
      },
      
      // Store Keepers - Admin only
      { 
        id: 'store-keepers', 
        icon: Store, 
        label: 'Store Keepers', 
        path: `/${rolePath}/store-keepers`, 
        show: canViewStoreKeepers,
        description: 'Manage store keepers'
      },
      
      // Measurements - Admin and Store Keeper ONLY (NO Cutting Master)
      { 
        id: 'measurements', 
        icon: Ruler, 
        label: 'Measurements', 
        path: `/${rolePath}/measurements`, 
        show: canViewMeasurement,
        description: 'Size templates and measurements'
      },
      
      // Products - Admin and Store Keeper only
      { 
        id: 'products', 
        icon: Package, 
        label: 'Products', 
        path: `/${rolePath}/products`, 
        show: canViewProducts,
        description: 'Manage fabrics, categories, items'
      },
      
      // Customers - Admin and Store Keeper only
      { 
        id: 'customers', 
        icon: Users, 
        label: 'Customers', 
        path: `/${rolePath}/customers`, 
        show: canViewCustomers,
        description: 'Customer management'
      },
      
      // Banking - Admin and Store Keeper both can see (Dropdown) - FULL access
      { 
        id: 'banking', 
        icon: Landmark, 
        label: 'Banking', 
        path: '#', 
        show: canViewBanking, 
        isDropdown: true,
        description: 'Complete financial management'
      },
      
      // Reports - Admin and Store Keeper
      { 
        id: 'reports', 
        icon: BarChart3, 
        label: 'Reports', 
        path: '#', 
        show: canViewReports, 
        isDropdown: true,
        description: 'Analytics and reports'
      },
      
      // Staff - Admin only
      { 
        id: 'staff', 
        icon: UserCircle, 
        label: 'Staff', 
        path: `/${rolePath}/staff`, 
        show: canViewStaff,
        description: 'Staff management'
      },
      
      // Settings - Admin only
      { 
        id: 'settings', 
        icon: Settings, 
        label: 'Settings', 
        path: `/${rolePath}/settings`, 
        show: canViewSettings,
        description: 'System configuration'
      },
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
      item.id.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  };

  const filteredNavItems = getFilteredNavItems();
  const navigationItems = getNavigationItems();
  const hasNoResults = filteredNavItems.length === 0 && searchQuery.trim() !== '';

  // Check if any banking sub-item is active
  const isBankingActive = bankingItems.some(item => location.pathname.includes(item.id));

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
              <span className="text-sm font-bold text-white truncate w-24 leading-none mb-1">
                {user?.name || "User"}
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Link 
              to={`/${rolePath}/settings`} 
              title="Settings" 
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"
            >
              <Settings size={18} />
            </Link>
            <NotificationBell />
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
              className="w-full bg-[#1e293b]/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600 text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors"
              >
                <X size={16} />
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
                  // Dropdown items (Banking, Reports)
                  <div>
                    <button 
                      onClick={() => {
                        if (item.id === 'banking') setBankingOpen(!bankingOpen);
                        if (item.id === 'reports') setReportsOpen(!reportsOpen);
                      }}
                      className={`w-full nav-link flex justify-between items-center ${
                        (item.id === 'banking' && (bankingOpen || isBankingActive)) || 
                        (item.id === 'reports' && reportsOpen) ? 'text-white' : ''
                      }`}
                      title={item.description}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={19} /> 
                        <span>{item.label}</span>
                      </div>
                      {(item.id === 'banking' && (bankingOpen || isBankingActive)) || 
                       (item.id === 'reports' && reportsOpen) ? 
                        <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                    </button>
                    
                    {/* ✅ BANKING DROPDOWN - FULL ACCESS for Store Keeper */}
                    {item.id === 'banking' && (bankingOpen || isBankingActive) && (
                      <div className="ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1">
                        {bankingItems.map(subItem => (
                          <Link 
                            key={subItem.id}
                            to={subItem.path} 
                            className={`flex items-center gap-2 py-2 text-sm transition-colors font-medium group ${
                              location.pathname.includes(subItem.id)
                                ? 'text-blue-400'
                                : 'text-slate-500 hover:text-blue-400'
                            }`}
                            title={subItem.description}
                          >
                            <subItem.icon size={14} className="group-hover:scale-110 transition-transform" />
                            {subItem.label}
                            {location.pathname.includes(subItem.id) && (
                              <span className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Reports Dropdown */}
                    {item.id === 'reports' && reportsOpen && (
                      <div className="ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4 py-1">
                        {reportsItems.map(subItem => (
                          <Link 
                            key={subItem.id}
                            to={subItem.path} 
                            className={`flex items-center gap-2 py-2 text-sm transition-colors font-medium group ${
                              location.pathname.includes(subItem.id)
                                ? 'text-blue-400'
                                : 'text-slate-500 hover:text-blue-400'
                            }`}
                          >
                            <subItem.icon size={14} className="group-hover:scale-110 transition-transform" />
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular Navigation Links
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive(item.path) ? 'active-link' : ''}`}
                    title={item.description}
                  >
                    <item.icon size={19} /> 
                    <span>{item.label}</span>
                    {isActive(item.path) && (
                      <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                    )}
                  </Link>
                )}
              </div>
            ))
          )}
        </nav>

        {/* QUICK STATS AT BOTTOM */}
        <div className="px-4 py-3 border-t border-slate-800 bg-[#0F172A]">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          {/* Quick Banking Summary (visible if banking is active) */}
          {isBankingActive && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-blue-400 flex items-center gap-1">
              <IndianRupee size={10} />
              <span>Banking Module Active</span>
            </div>
          )}
        </div>

        {/* SIGN OUT AT BOTTOM */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
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
            {/* Show Banking indicator if on banking page */}
            {location.pathname.includes('banking') && (
              <div className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                <Landmark size={12} />
                <span>Banking Module</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-all">
              <HelpCircle size={18} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-all">
              <Bell size={18} />
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="text-[11px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 uppercase tracking-tighter">
              {new Date().toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
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
          cursor: pointer;
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
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-hidden {
          scrollbar-width: none;
        }
        
        /* Animation for dropdown */
        .dropdown-enter {
          opacity: 0;
          transform: translateY(-10px);
        }
        .dropdown-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 200ms, transform 200ms;
        }
        .dropdown-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .dropdown-exit-active {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 200ms, transform 200ms;
        }
      `}</style>
    </div>
  );
}