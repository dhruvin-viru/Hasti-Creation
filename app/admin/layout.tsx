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
  Building2
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
    { href: '/admin', label: 'Order Dashboard', icon: Package },
    { href: '/admin/products', label: 'Product Manager', icon: Grid },
    { href: '/admin/categories', label: 'Categories', icon: Sparkles },
    { href: '/admin/coupons', label: 'Coupon Engine', icon: Tag },
    { href: '/admin/banners', label: 'Hero Banners', icon: ImageIcon },
    { href: '/admin/settings', label: 'Store Address & GSTIN', icon: Building2 },
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

  // Authenticated Admin Dashboard Layout
  return (
    <div className="py-6 space-y-8">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Admin Control Panel</h1>
            <p className="text-xs text-brand-200">Production Mode • Authenticated as Admin</p>
          </div>
        </div>

        {/* Sub-navigation tabs & Logout */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${active
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all whitespace-nowrap ml-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
