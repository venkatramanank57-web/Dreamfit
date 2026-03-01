// components/common/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationAsRead,        // ✅ Fixed - matches slice
  markAllNotificationsAsRead,     // ✅ Fixed - matches slice
  selectNotifications,
  selectUnreadCount
} from '../../features/notification/notificationSlice';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 5 }));
    
    const interval = setInterval(() => {
      dispatch(fetchNotifications({ limit: 5 }));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));        // ✅ Fixed - uses correct name
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());      // ✅ Fixed - uses correct name
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'work-assigned': return '✂️';
      case 'work-accepted': return '✅';
      case 'work-status-update': return '🔄';
      case 'order-confirmed': return '📦';
      case 'tailor-assigned': return '👔';
      default: return '📌';
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.reference?.workId) {
      return `/works/${notification.reference.workId}`;
    }
    if (notification.reference?.orderId) {
      return `/orders/${notification.reference.orderId}`;
    }
    return '#';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-slate-800 rounded-lg transition-all"
      >
        <Bell size={20} className="text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  to={getNotificationLink(notif)}
                  onClick={() => {
                    if (!notif.isRead) handleMarkAsRead(notif._id);
                    setShowDropdown(false);
                  }}
                  className={`block p-4 border-b border-slate-100 hover:bg-slate-50 transition-all ${
                    !notif.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-lg">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                <p>No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100">
            <Link
              to="/notifications"
              onClick={() => setShowDropdown(false)}
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Notifications
              <ChevronRight size={16} className="inline ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}