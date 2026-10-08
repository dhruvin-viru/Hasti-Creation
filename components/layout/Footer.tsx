'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories, getStoreSettings } from '@/lib/firestoreServices';
import { Category } from '@/types/ecommerce';
import { ShoppingBag, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.jpg');

  useEffect(() => {
    getCategories().then(setCategories);
    getStoreSettings().then((s) => {
      if (s?.logoUrl) setLogoUrl(s.logoUrl);
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-glow shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Hasti Creation" className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-black text-xl text-white tracking-tight">HASTI CREATION</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your premier destination for high-grade fashion, apparel, and lifestyle gear.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Shop Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.slug || cat.id}`} className="hover:text-white transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link href="/products" className="hover:text-white transition-colors">
                    All Categories
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/checkout" className="hover:text-white transition-colors">Checkout</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">VIP Newsletter</h4>
            <p className="text-xs text-slate-400 mb-3">Subscribe for exclusive flash coupon codes and deal alerts.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button className="px-4 py-2.5 text-xs font-extrabold rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-glow-indigo">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Hasti Creation. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
            <span>Crafted for high performance</span>
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};
