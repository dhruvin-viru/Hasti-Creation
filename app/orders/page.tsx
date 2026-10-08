'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/lib/firestoreServices';
import { Order, OrderStatus } from '@/types/ecommerce';
import { PackageCheck, ShoppingBag, ArrowRight, Clock, Truck, CheckCircle2, MapPin, LogIn, ChevronRight, RefreshCw } from 'lucide-react';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserOrders(user.uid, user.email || undefined).then((res) => {
        setOrders(res);
        setLoading(false);
      });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="py-16 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Fetching your order history...</p>
        </div>
        <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  // Unauthenticated view
  if (!user) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-md">
          <LogIn className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to View Orders
          </h1>
          <p className="text-xs text-slate-500">
            Please log in to your account to view your past orders, delivery tracking, and official invoices.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <Link
            href="/login"
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PackageCheck className="w-8 h-8 text-brand-600" />
            <span>My Orders & Purchases</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time fulfillment tracking, delivery addresses, and shipping labels
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors self-start md:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-brand-600" />
          <span>Browse Storefront</span>
        </Link>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders with <strong>{user.email}</strong> yet. Explore our latest products and place an order!
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Order Reference</span>
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">#{order.id}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-all"
                  >
                    <span>View & Track Order</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Product Thumbnails & Titles */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Purchased Items ({order.items.length})
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-xs flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                          <p className="text-slate-500 font-medium">
                            {item.quantity} x ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Total Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-600" />
                      <span>Shipping Address</span>
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">{order.customerDetails.name}</p>
                    <p className="text-slate-500 truncate">{order.customerDetails.address}, {order.customerDetails.city}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Paid</span>
                    <span className="text-lg font-extrabold text-brand-600">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: 'Pending Approval', className: 'bg-amber-100 text-amber-800 border-amber-300' },
    processing: { label: 'Processing / Ready to Ship', className: 'bg-brand-100 text-brand-800 border-brand-300' },
    shipped: { label: 'Shipped & In Transit', className: 'bg-purple-100 text-purple-800 border-purple-300' },
    delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-800 border-rose-300' },
  };

  const current = map[status] || map.pending;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold border ${current.className}`}>
      {current.label}
    </span>
  );
}
