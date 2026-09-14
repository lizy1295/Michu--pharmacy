'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { isStaffRole } from '@/lib/shared';

/* ─── Sidebar nav items ──────────────────────────────────── */
const NAV_ITEMS = [
  { name: 'Dashboard',          href: '/admin',                  icon: 'dashboard'      },
  { name: 'Products',           href: '/admin/products',         icon: 'products'       },
  { name: 'Categories',         href: '/admin/categories',       icon: 'categories'     },
  { name: 'Customers',          href: '/admin/customers',        icon: 'customers'      },
  { name: 'Orders',             href: '/admin/orders',           icon: 'orders'         },
  { name: 'Inventory & Stock',  href: '/admin/inventory',        icon: 'inventory'      },
  { name: 'Prescriptions',      href: '/admin/prescriptions',    icon: 'prescriptions'  },
  { name: 'Admin Accounts',     href: '/admin/admins',           icon: 'admins'         },
  { name: 'Advertisements',     href: '/admin/advertisements',   icon: 'advertisements' },
  { name: 'Health Articles',    href: '/admin/articles',         icon: 'articles'       },
  { name: 'Branches',           href: '/admin/branches',         icon: 'branches'       },
  { name: 'Doctors',            href: '/admin/doctors',          icon: 'doctors'        },
  { name: 'Partners',           href: '/admin/partners',         icon: 'partners'       },
  { name: 'Reports',            href: '/admin/reports',          icon: 'reports'        },
  { name: 'Settings',           href: '/admin/settings',         icon: 'settings'       },
];

/* ─── Icon map ───────────────────────────────────────────── */
const ICONS: Record<string, React.ReactNode> = {
  dashboard:     <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  products:      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  categories:    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  customers:     <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  orders:        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  inventory:     <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  prescriptions: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  admins:        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  advertisements:<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  videos:        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  articles:      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v1" /></svg>,
  branches:      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  doctors:       <span className="text-lg leading-none grayscale" style={{ filter: 'grayscale(100%) opacity(0.8)' }}>👨‍⚕️</span>,
  partners:      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  reports:       <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  settings:      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

/* ─── Collapse toggle icon ───────────────────────────────── */
function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

interface AdminUser {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  phone?: string;
}

/* ─── Format Role Helper ─────────────────────────────────── */
function formatRoleName(role?: string): string {
  if (!role) return 'Admin';
  const clean = role.toLowerCase().replace(/_/g, ' ');
  if (clean.includes('super')) return 'Super Admin';
  if (clean.includes('admin')) return 'Administrator';
  if (clean.includes('pharmacist')) return 'Pharmacist';
  if (clean.includes('manager')) return 'Manager';
  if (clean.includes('staff')) return 'Staff';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'SA';
}

/* ─── Main component ─────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen,        setSidebarOpen]        = useState(false);
  const [collapsed,          setCollapsed]          = useState(false);
  const [notificationsOpen,  setNotificationsOpen]  = useState(false);
  const [userDropdownOpen,   setUserDropdownOpen]   = useState(false);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [currentAdmin,       setCurrentAdmin]       = useState<AdminUser>({
    name: 'Super Admin',
    email: 'admin@michupharmacy.com',
    role: 'super_admin',
  });

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const pathname        = usePathname();
  const router          = useRouter();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Low Stock Alert',           desc: 'Amoxicillin 500mg — only 4 units left.',         time: '10m',  unread: true,  link: '/admin/products'       },
    { id: 2, title: 'New Prescription',          desc: 'Rx #8942 requires pharmacist verification.',     time: '25m',  unread: true,  link: '/admin/prescriptions'  },
    { id: 3, title: 'Order Ready for Dispatch',  desc: 'Order #ORD-2026-081 ready for delivery.',        time: '1h',   unread: false, link: '/admin/orders'         },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Load active logged-in admin data immediately
  useEffect(() => {
    const loadAdmin = () => {
      try {
        const adminToken = localStorage.getItem('admin_access_token');
        const storedAdmin = localStorage.getItem('admin_data');

        if (!adminToken || !storedAdmin) {
          router.replace('/admin/login');
          return;
        }

        const parsed = JSON.parse(storedAdmin);
        if (isStaffRole(parsed.role)) {
          setCurrentAdmin(parsed);
        } else {
          router.replace('/admin/login');
        }
      } catch (err) {
        console.error('Failed to parse admin user from localStorage:', err);
        router.replace('/admin/login');
      }
    };

    loadAdmin();
    window.addEventListener('storage', loadAdmin);
    return () => window.removeEventListener('storage', loadAdmin);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim())
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_data');
    router.push('/admin/login');
  };

  const isSuperAdmin = (currentAdmin.role || '').toLowerCase().includes('super');
  const initials = getInitials(currentAdmin.name, currentAdmin.email);
  const formattedRole = formatRoleName(currentAdmin.role);

  // If on admin login page, do not render sidebar or top navigation bar
  if (pathname === '/admin/login' || pathname?.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════ */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          bg-white border-r border-slate-200/80 shadow-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}
        `}
      >
        {/* Logo + collapse toggle */}
        <div className="flex items-center h-16 px-3.5 border-b border-slate-100 shrink-0">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0">
                MP
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-[13px] font-extrabold text-slate-900 truncate">Michu Admin</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Pharmacy Hub</p>
              </div>
            </Link>
          ) : (
            <Link href="/admin" className="mx-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                MP
              </div>
            </Link>
          )}

          {/* Single chevron toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition shrink-0 ml-1"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-2.5 px-2 space-y-0.5 custom-scrollbar">
          {NAV_ITEMS.map(item => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium
                  transition-all duration-150 group
                  ${active
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="shrink-0">{ICONS[item.icon]}</span>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Storefront Link & Logout */}
        <div className="shrink-0 border-t border-slate-100 p-2 space-y-1">
          {!collapsed && (
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50 transition"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Storefront ↗
            </Link>
          )}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium
              text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition w-full
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════ */}
      <div className={`transition-all duration-300 overflow-x-hidden ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>

        {/* ── Topbar ── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-14 shadow-xs">
          <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-4">

            {/* Left: Mobile Toggle & Search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Search products or orders…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-64 md:w-80 rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-4 py-1.5 text-[13px] focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
                />
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>
            </div>

            {/* Right: Live Status, Alerts, Dynamic Profile Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Hub
              </span>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(o => !o)}
                  className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                  title="Alerts"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-900">Alerts</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[11px] text-emerald-600 font-semibold hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => setNotificationsOpen(false)}
                          className={`block p-2.5 rounded-xl text-[12px] transition ${
                            n.unread
                              ? 'bg-emerald-50 border border-emerald-100'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-slate-400 text-[10px] shrink-0">{n.time}</span>
                          </div>
                          <p className="text-slate-500">{n.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Logged-in Admin Profile with Dropdown */}
              <div className="relative pl-2 border-l border-slate-200" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(o => !o)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition text-left"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[12px] font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentAdmin.name || 'Admin User'}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-extrabold">{formattedRole}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-xl ${isSuperAdmin ? 'bg-gradient-to-tr from-emerald-600 to-teal-600' : 'bg-slate-800'} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                    {initials}
                  </div>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900">{currentAdmin.name || 'Admin User'}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {formattedRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{currentAdmin.email || 'admin@michupharmacy.com'}</p>
                    </div>

                    <div className="space-y-0.5 text-xs font-semibold">
                      <Link
                        href="/admin/admins"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Admin & Staff Accounts
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-emerald-700 transition"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                        Store Settings
                      </Link>
                    </div>

                    <div className="pt-1.5 mt-1.5 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 w-full text-xs font-bold transition text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-7rem)]">
          {children}
        </main>

        {/* ── Compact footer ── */}
        <footer className="px-6 py-2.5 border-t border-slate-200/80 bg-white/60 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Michu Pharmacy Management Console · v2.5
          </span>
          <div className="flex items-center gap-4">
            <Link href="/admin/settings" className="hover:text-slate-600 transition">Settings</Link>
            <Link href="/admin/admins" className="hover:text-slate-600 transition">Admin Accounts</Link>
            <span>© {new Date().getFullYear()} Michu Pharmacy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
