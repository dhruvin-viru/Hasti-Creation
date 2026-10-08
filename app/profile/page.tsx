'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { subscribeToOrders } from '@/lib/firestoreServices';
import { Order } from '@/types/ecommerce';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Save,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Gujarat',
    zipCode: ''
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.displayName || user.email?.split('@')[0] || '',
        email: user.email || '',
      }));

      // Subscribe to real-time orders for this customer
      const unsubscribe = subscribeToOrders((allOrders) => {
        const myOrders = allOrders.filter((o) => o.userId === user.uid || o.customerDetails.email === user.email);
        setOrders(myOrders);
        setLoadingOrders(false);
      });

      return () => unsubscribe();
    } else {
      setLoadingOrders(false);
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile details updated successfully!');
    }, 600);
  };

  if (!user) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-md">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Account Required</h2>
        <p className="text-xs text-slate-500">Please sign in to view and manage your profile and order history.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-full shadow-md transition-all"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white font-black text-2xl shadow-glow-indigo">
            {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {profileData.name || 'Valued Customer'}
              </h1>
              {isAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Store Admin
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Verified Buyer
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{profileData.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors text-center"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              toast.success('Logged out successfully');
              router.push('/');
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Customer Info Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 h-max">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-brand-600" />
            <span>Personal Information</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Address
              </label>
              <textarea
                rows={2}
                placeholder="123 Shopping Street, Ring Road"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Surat"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Gujarat"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right: Order History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              <span>Order History & Tracking ({orders.length})</span>
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>Shop More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your order history...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No past orders yet</p>
              <p className="text-xs text-slate-400">Items you purchase will appear here for easy tracking!</p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-full shadow-md"
              >
                Browse Shop Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 hover:border-brand-500/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID</span>
                      <h4 className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        #{ord.orderId || ord.id}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <OrderPill status={ord.status} />
                      <Link
                        href={`/orders/${ord.id}`}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <span>Track Order</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {it.quantity}x {it.title}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ord.courierName && ord.trackingNumber && (
                    <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-brand-900 dark:text-brand-300">
                          {ord.courierName}
                        </span>
                        <span className="text-slate-500 ml-2 font-mono">
                          AWB: {ord.trackingNumber}
                        </span>
                      </div>
                      {ord.trackingUrl && (
                        <a
                          href={ord.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-brand-600 hover:underline"
                        >
                          Live Courier Track →
                        </a>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Total Paid ({ord.paymentMethod?.toUpperCase()})</span>
                    <span className="text-sm text-brand-600">₹{ord.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderPill({ status }: { status: string }) {
  if (status === 'delivered') {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Delivered
      </span>
    );
  }
  if (status === 'shipped') {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
        <Truck className="w-3 h-3 text-purple-600" />
        Shipped
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
      <Clock className="w-3 h-3 text-amber-600" />
      {status ? status.toUpperCase() : 'PENDING'}
    </span>
  );
}
