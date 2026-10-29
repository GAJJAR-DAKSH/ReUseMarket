import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  PlusCircle,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
  CheckCircle2,
  Gift,
  BookmarkCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { timeAgo } from '../utils/formatters';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-charcoal-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Wordmark */}
        <Link to="/" className="flex flex-col flex-shrink-0 group">
          <span className="text-lg font-bold tracking-tight text-charcoal flex items-center gap-0.5 group-hover:opacity-90 transition-opacity">
            ReUse<span className="text-primary">Market</span>
          </span>
          <span className="text-[10px] text-charcoal-muted tracking-wide uppercase font-medium -mt-1">
            Campus Exchange
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search books, lab coats, cycles, dorm essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-card border border-charcoal-border bg-[#F8F9F6] text-charcoal placeholder-charcoal-subtle focus:bg-white focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            to="/marketplace"
            className={`text-xs font-medium transition-colors ${
              location.pathname === '/marketplace' ? 'text-primary font-semibold' : 'text-charcoal hover:text-primary'
            }`}
          >
            Explore
          </Link>
          <Link
            to="/marketplace?listingType=Free+Donation"
            className="text-xs font-medium text-charcoal hover:text-primary transition-colors flex items-center gap-1"
          >
            <Gift className="w-3.5 h-3.5 text-emerald-700" />
            Donations
          </Link>
          <Link
            to="/sustainability"
            className={`text-xs font-medium transition-colors ${
              location.pathname === '/sustainability' ? 'text-primary font-semibold' : 'text-charcoal hover:text-primary'
            }`}
          >
            Impact
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard?tab=reservations"
              className="text-xs font-medium text-charcoal hover:text-primary transition-colors flex items-center gap-1"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
              My Reservations
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sell Button */}
          <Link
            to="/create-listing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-primary text-white text-xs font-medium hover:bg-primary-hover shadow-subtle transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sell an Item</span>
            <span className="sm:hidden">Sell</span>
          </Link>

          {/* Notifications Dropdown (If authenticated) */}
          {isAuthenticated && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-card text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Menu */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-charcoal-border rounded-card shadow-elevated py-2 z-50">
                  <div className="px-4 py-2 border-b border-charcoal-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal">Campus Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-charcoal-border">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-charcoal-muted">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            if (n.link) navigate(n.link);
                            setNotifDropdownOpen(false);
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-charcoal-light transition-colors ${
                            !n.isRead ? 'bg-primary-surface/60 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="font-semibold text-charcoal truncate">{n.title}</span>
                            <span className="text-charcoal-muted text-[10px] flex-shrink-0">
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-charcoal-muted line-clamp-2 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth buttons */}
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-card border border-charcoal-border hover:bg-charcoal-light transition-all text-xs"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-primary-light flex items-center justify-center text-primary font-bold">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="font-medium text-charcoal max-w-[90px] truncate hidden sm:inline">
                  {user?.name}
                </span>
                <ChevronDown className="w-3 h-3 text-charcoal-muted" />
              </button>

              {/* Profile Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-charcoal-border rounded-card shadow-elevated py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-charcoal-border">
                    <p className="text-xs font-semibold text-charcoal truncate">{user?.name}</p>
                    <p className="text-[11px] text-charcoal-muted truncate">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px]">
                      {user?.isVerified ? (
                        <span className="badge-verified">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Student
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                          Pending Verification
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal hover:bg-charcoal-light transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-charcoal-muted" />
                    Student Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 font-medium transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      Campus Admin Portal
                    </Link>
                  )}

                  <div className="border-t border-charcoal-border my-1" />

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-xs py-1.5 px-3">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-xs py-1.5 px-3 hidden sm:inline-flex">
                Join Campus
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-card text-charcoal-muted hover:text-charcoal hover:bg-charcoal-light transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-charcoal-border bg-white px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                type="text"
                placeholder="Search campus items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-card border border-charcoal-border bg-[#F8F9F6] text-charcoal"
              />
            </div>
          </form>

          <div className="space-y-1 text-sm font-medium">
            <Link
              to="/marketplace"
              className="block px-3 py-2 rounded-card text-charcoal hover:bg-charcoal-light"
            >
              Explore All Items
            </Link>
            <Link
              to="/marketplace?listingType=Free+Donation"
              className="block px-3 py-2 rounded-card text-charcoal hover:bg-charcoal-light"
            >
              Free Student Donations
            </Link>
            <Link
              to="/sustainability"
              className="block px-3 py-2 rounded-card text-charcoal hover:bg-charcoal-light"
            >
              Campus Sustainability Impact
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard?tab=reservations"
                  className="block px-3 py-2 rounded-card text-charcoal hover:bg-charcoal-light"
                >
                  My Reservations & Handover Codes
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-card text-charcoal hover:bg-charcoal-light"
                >
                  My Profile & Listings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-card text-rose-700 bg-rose-50"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-card text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link to="/login" className="btn-secondary w-full text-xs">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary w-full text-xs">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
