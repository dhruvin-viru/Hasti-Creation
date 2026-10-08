'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  PackageCheck,
  UserCheck,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { getItemCount, openCart } = useCartStore();
  const { user, logout } = useAuth();
  const itemCount = getItemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-indigo group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  HASTI <span className="text-brand-600 dark:text-brand-400">CREATION</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-400 uppercase flex items-center gap-1">
                  <span>Luxury Commerce</span>
                  <Sparkles className="w-2.5 h-2.5 text-gold-500" />
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search products, gear & gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs font-medium bg-slate-100/90 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-inner"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <button type="submit" className="sr-only">Search</button>
          </form>

          {/* Desktop Links & Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-xs font-bold tracking-wide uppercase text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</Link>
              <Link href="/products" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Shop All</Link>
              <Link href="/orders" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-brand-500" />
                <span>My Orders</span>
              </Link>
              <Link href="/profile" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">My Profile</Link>
            </nav>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2.5 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-full transition-all"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-accent-600 to-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-scale-in shadow-glow-rose">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {mounted && user ? (
                <div className="flex items-center gap-2 pl-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="max-w-[90px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-xs font-extrabold rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-md transform hover:scale-105"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Cart & Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={openCart}
              className="relative p-2 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              <ShoppingBag className="w-6 h-6" />
              {mounted && itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-accent-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </form>
            <nav className="flex flex-col gap-2 font-bold text-xs uppercase text-slate-700 dark:text-slate-200">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Home</Link>
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Shop All Catalog</Link>
              <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">My Orders & Tracking</Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">My Profile</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
