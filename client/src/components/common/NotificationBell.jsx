// src/components/common/NotificationBell.jsx
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function NotificationBell() {
  const { user } = useSelector((state) => state.auth);
  const rolePath = user?.role === "ADMIN" ? "admin" : 
                   user?.role === "STORE_KEEPER" ? "storekeeper" : 
                   "cuttingmaster";

  return (
    <Link 
      to={`/${rolePath}/notifications`}
      className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all relative"
      title="Notifications"
    >
      <Bell size={18} />
      <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
    </Link>
  );
}