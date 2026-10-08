'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { subscribeToOrder, updateOrderAddress } from '@/lib/firestoreServices';
import { OrderTimeline } from '@/components/store/OrderTimeline';
import { Order, CustomerDetails } from '@/types/ecommerce';
import { ShippingLabelModal } from '@/components/admin/ShippingLabelModal';
import { PackageCheck, ArrowLeft, ShieldCheck, Mail, MapPin, Printer, Edit3, X, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLabelModal, setShowLabelModal] = useState(false);

  // Address Editing State
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    // Subscribe to Firestore doc in real-time using onSnapshot
    const unsubscribe = subscribeToOrder(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
      if (updatedOrder) {
        setAddressForm({
          name: updatedOrder.customerDetails.name || '',
          email: updatedOrder.customerDetails.email || '',
          phone: updatedOrder.customerDetails.phone || '',
          address: updatedOrder.customerDetails.address || '',
          city: updatedOrder.customerDetails.city || '',
          state: updatedOrder.customerDetails.state || '',
          zipCode: updatedOrder.customerDetails.zipCode || ''
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSavingAddress(true);
    try {
      await updateOrderAddress(order.id, addressForm);
      toast.success('Delivery address updated successfully!');
      setOrder({ ...order, customerDetails: addressForm });
      setEditingAddress(false);
    } catch (error) {
      toast.error('Failed to update address.');
    } finally {
      setSavingAddress(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 space-y-6 max-w-4xl mx-auto">
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <PackageCheck className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Order Not Found</h2>
        <p className="text-xs text-slate-500">We couldn't locate an order with ID: #{orderId}</p>
        <Link href="/products" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-full">
          Back to Store
        </Link>
      </div>
    );
  }

  const canEditAddress = order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled';

  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        {(order.status === 'shipped' || order.status === 'delivered') && (
          <button
            onClick={() => setShowLabelModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Download Invoice & Shipping Label</span>
          </button>
        )}
      </div>

      {/* Real-Time Firestore Step Timeline */}
      <OrderTimeline order={order} isRealtime={true} />

      {/* Order Details & Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Address */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Delivery Destination</span>
            </h3>
            {canEditAddress && (
              <button
                onClick={() => setEditingAddress(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-500 inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg transition-colors"
                title="Edit delivery address before order is shipped"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Address</span>
              </button>
            )}
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{order.customerDetails.name}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {order.customerDetails.address}, {order.customerDetails.city}
            {order.customerDetails.state ? `, ${order.customerDetails.state}` : ''}, {order.customerDetails.zipCode}
          </p>
          <p className="text-xs text-slate-500 font-mono">Phone: {order.customerDetails.phone}</p>
        </div>

        {/* Customer Email */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-brand-600" />
            <span>Notifications Email</span>
          </h3>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{order.customerDetails.email}</p>
          <p className="text-[11px] text-slate-500">Live shipping updates & receipt dispatched to this address.</p>
        </div>

        {/* Total Cost */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Order Value</span>
          </h3>
          <div className="text-2xl font-extrabold text-brand-600">${order.totalAmount.toFixed(2)}</div>
          {order.discountApplied > 0 && (
            <p className="text-[11px] text-emerald-600 font-semibold">Includes ${order.discountApplied.toFixed(2)} discount</p>
          )}
        </div>
      </div>

      {/* Items Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Purchased Items ({order.items.length})
        </h3>
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <Image src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'} alt="" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-slate-400">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="font-extrabold text-slate-900 dark:text-white">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT ADDRESS MODAL */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5">
            <button
              onClick={() => setEditingAddress(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Delivery Shipping Address
                </h3>
                <p className="text-xs text-slate-500">Order #{order.id}</p>
              </div>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address & House/Flat No.
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Zip / Pin Code
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAddress(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {savingAddress ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Address...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Address Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Label Modal */}
      {showLabelModal && (
        <ShippingLabelModal order={order} onClose={() => setShowLabelModal(false)} />
      )}
    </div>
  );
}

