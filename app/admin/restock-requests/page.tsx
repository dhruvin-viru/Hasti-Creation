'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StockNotification, Product } from '@/types/ecommerce';
import { 
  subscribeToStockNotifications, 
  updateStockNotificationStatus, 
  deleteStockNotification,
  getProducts 
} from '@/lib/firestoreServices';
import { 
  Bell, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  Trash2, 
  Search, 
  AlertCircle,
  ExternalLink,
  Clock,
  Send,
  PackageCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRestockRequestsPage() {
  const [notifications, setNotifications] = useState<StockNotification[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'pending' | 'notified'>('all');

  useEffect(() => {
    // Load products to check current live stock levels
    getProducts().then(setProducts);

    // Realtime listener for restock notifications
    const unsubscribe = subscribeToStockNotifications((data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getProductStock = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    return prod ? prod.stock : 0;
  };

  const handleMarkNotified = async (id: string) => {
    try {
      await updateStockNotificationStatus(id, 'notified');
      toast.success('Marked as notified!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove restock request for "${name}"?`)) {
      try {
        await deleteStockNotification(id);
        toast.success('Restock request deleted');
      } catch (error) {
        toast.error('Failed to delete request');
      }
    }
  };

  const formatWhatsAppUrl = (phone: string, name: string, title: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Hi ${name}, good news! Your requested product "${title}" is NOW BACK IN STOCK at Hasti Creation! Order now before stock runs out: ${window.location.origin}/products`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  };

  const filteredNotifications = notifications.filter((item) => {
    const currentStock = getProductStock(item.productId);
    const isReady = currentStock > 0;

    const matchesSearch = 
      item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerPhone.includes(searchQuery) ||
      (item.productSku && item.productSku.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ready') return isReady && item.status === 'pending';
    if (statusFilter === 'pending') return item.status === 'pending';
    if (statusFilter === 'notified') return item.status === 'notified';

    return true;
  });

  const readyCount = notifications.filter(n => getProductStock(n.productId) > 0 && n.status === 'pending').length;
  const pendingCount = notifications.filter(n => n.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Customer Restock Alerts & Notifications</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track customer requests for out-of-stock items and message them on WhatsApp when products go live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by product, SKU, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-64"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Alert Requests</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{notifications.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">Ready to Alert (In Stock)</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{readyCount} Customers</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Pending Alerts</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          All Requests ({notifications.length})
        </button>

        <button
          onClick={() => setStatusFilter('ready')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            statusFilter === 'ready'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Ready to Notify ({readyCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100'
          }`}
        >
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setStatusFilter('notified')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            statusFilter === 'notified'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100'
          }`}
        >
          Notified / Resolved
        </button>
      </div>

      {/* Restock Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading restock notification requests...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No restock notification requests found</p>
            <p className="text-xs text-slate-400">When customers click "Notify Me" on out-of-stock products, their requests appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Requested Product</th>
                  <th className="px-6 py-4">Live Stock Status</th>
                  <th className="px-6 py-4">Customer Contact Details</th>
                  <th className="px-6 py-4">Requested Date</th>
                  <th className="px-6 py-4 text-right">Message & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredNotifications.map((item) => {
                  const liveStock = getProductStock(item.productId);
                  const isBackInStock = liveStock > 0;
                  const waUrl = formatWhatsAppUrl(item.customerPhone, item.customerName, item.productTitle);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Product Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            {item.productImage ? (
                              <Image src={item.productImage} alt="" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px]">No Pic</div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{item.productTitle}</div>
                            {item.productSku && (
                              <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400">
                                SKU: {item.productSku}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Live Stock Status Column */}
                      <td className="px-6 py-4">
                        {isBackInStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            In Stock ({liveStock} units)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Still Out of Stock (0)
                          </span>
                        )}
                      </td>

                      {/* Customer Contact Column */}
                      <td className="px-6 py-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{item.customerName}</div>
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          📞 {item.customerPhone}
                        </div>
                        {item.customerEmail && (
                          <div className="text-[10px] text-slate-400">
                            ✉️ {item.customerEmail}
                          </div>
                        )}
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString('en-GB')}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Direct WhatsApp Messaging Button */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                          title="Send restock alert on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Email Button */}
                        {item.customerEmail && (
                          <a
                            href={`mailto:${item.customerEmail}?subject=${encodeURIComponent(`Product Back in Stock: ${item.productTitle}`)}&body=${encodeURIComponent(`Hi ${item.customerName},\n\nGood news! The product "${item.productTitle}" you requested is now back in stock at Hasti Creation.\n\nOrder now before stock runs out!`)}`}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg inline-block transition-colors"
                            title="Send email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}

                        {/* Mark Notified Toggle */}
                        {item.status === 'pending' ? (
                          <button
                            onClick={() => handleMarkNotified(item.id)}
                            className="px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            Mark Notified
                          </button>
                        ) : (
                          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Notified
                          </span>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(item.id, item.customerName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg inline-block transition-colors"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
