'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Package,
  Grid,
  Tag,
  Image as ImageIcon,
  Sparkles,
  Lock,
  LogOut,
  Mail,
  Key,
  AlertCircle,
  Loader2,
  Building2,
  ChevronDown,
  Bell,
  Headphones,
  Home,
  Truck,
  Store
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/admin/verify', { cache: 'no-store' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.authenticated) {
          setIsAuthenticated(true);
          return;
        }
      }
      setIsAuthenticated(false);
    } catch (err) {
      console.warn('Admin verify check:', err);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Admin authentication successful!');
        setIsAuthenticated(true);
        setEmail('');
        setPassword('');
      } else {
        setLoginError(data.error || 'Access denied. Invalid admin credentials.');
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      setLoginError('Authentication server error.');
      toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('Logged out of Admin Portal');
      setIsAuthenticated(false);
    } catch (error) {
      toast.error('Logout error');
    }
  };

  const navItems = [
    { href: '/admin/orders', label: 'Manage Orders', icon: Package, badge: null },
    { href: '/admin/products', label: 'Inventory & Products', icon: Grid, badge: null },
    { href: '/admin/restock-requests', label: 'Restock Requests', icon: Bell, badge: null },
    { href: '/admin/categories', label: 'Categories & Catalogs', icon: Sparkles, badge: null },
    { href: '/admin/coupons', label: 'Coupon Engine', icon: Tag, badge: null },
    { href: '/admin/banners', label: 'Hero Banners', icon: ImageIcon, badge: null },
    { href: '/admin/settings', label: 'Store Address & GSTIN', icon: Building2, badge: null },
  ];

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verifying Admin Access Permissions...</p>
      </div>
    );
  }

  // Unauthorized Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="py-12 max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-brand-950 to-slate-900 text-white flex items-center justify-center mx-auto shadow-xl border border-slate-800">
            <Lock className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Restricted Admin Portal
          </h1>
          <p className="text-xs text-slate-500">
            Server-side encrypted authorization required to access Hasti Creation management.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
          {loginError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Security Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
                <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Authenticate Admin Access</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 font-mono">
            Protected by Server HTTP-Only Session Verification
          </p>
        </div>
      </div>
    );
  }

  // Authenticated Supplier Hub Admin Dashboard Layout (Full Screen & Left Edge Attached)
  return (
    <div className="w-full flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#f4f5f8] dark:bg-slate-950">
      {/* Dark Sidebar attached directly to left screen edge */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#181920] text-slate-300 shadow-2xl flex flex-col justify-between border-r border-slate-800/80 rounded-none min-h-[calc(100vh-64px)] lg:sticky lg:top-16 z-20">
        <div>
          {/* Top Brand Dropdown Selector */}
          <div className="p-4 bg-[#14151a] border-b border-slate-800/60 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xs text-white tracking-wide truncate">
                HASTI CREATION
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Navigation Section */}
          <div className="p-3 space-y-4">
            {/* Home Link */}
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname === '/admin' ? 'text-white bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <div>
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Manage Business
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#292b38] text-white font-bold border-l-4 border-brand-500 shadow-sm pl-2.5'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-pink-600 text-white rounded uppercase">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 bg-[#14151a] border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-mono font-medium truncate">
            Supplier Hub v2.0
          </div>
          <button
            onClick={handleAdminLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Full-width Edge-to-Edge Main Content Panel */}
      <main className="flex-1 w-full min-w-0 bg-[#f4f5f8] dark:bg-slate-950 p-5 md:p-8 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
