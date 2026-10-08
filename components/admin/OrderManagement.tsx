'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Mail, 
  X, 
  Send,
  AlertCircle,
  RefreshCw,
  Search,
  Printer
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/ecommerce';
import { subscribeToOrders, updateOrderStatus, bookShipment } from '@/lib/firestoreServices';
import { ShippingLabelModal } from './ShippingLabelModal';
import toast from 'react-hot-toast';

export const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'shipped_delivered'>('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Booking Shipment & Printing Label
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<Order | null>(null);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSubmittingShipment, setIsSubmittingShipment] = useState(false);

  useEffect(() => {
    // Real-time listener for orders collection
    const unsubscribe = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'processing');
      toast.success(`Order #${orderId} accepted and moved to Processing!`);
    } catch (error) {
      toast.error('Failed to accept order.');
    }
  };

  const handleOpenShipmentModal = (order: Order) => {
    setSelectedOrderForShipment(order);
    setCourierName('Delhivery');
    setTrackingNumber('1490' + Math.floor(100000000000 + Math.random() * 900000000000));
    setTrackingUrl('https://www.delhivery.com/track/package');
  };

  const handleSubmitShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForShipment) return;
    if (!trackingNumber.trim() || !courierName.trim()) {
      toast.error('Please enter Courier Name and Tracking Number');
      return;
    }

    setIsSubmittingShipment(true);
    try {
      const orderToLabel: Order = {
        ...selectedOrderForShipment,
        status: 'shipped',
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim()
      };

      await bookShipment(
        selectedOrderForShipment.id,
        courierName.trim(),
        trackingNumber.trim(),
        trackingUrl.trim()
      );
      toast.success(`Order #${selectedOrderForShipment.id} dispatched via ${courierName}!`);
      setSelectedOrderForShipment(null);
      setSelectedOrderForLabel(orderToLabel);
    } catch (error) {
      toast.error('Failed to book shipment.');
    } finally {
      setIsSubmittingShipment(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm(`Are you sure you want to cancel order #${orderId}? Product stock will be automatically restored.`)) {
      try {
        await updateOrderStatus(orderId, 'cancelled');
        toast.success(`Order #${orderId} cancelled and stock restored!`);
      } catch (error) {
        toast.error('Failed to cancel order.');
      }
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      toast.success(`Order #${orderId} marked as Delivered!`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleTriggerReviewEmail = (order: Order) => {
    toast.success(`Review request email dispatched to ${order.customerDetails.email} for ${order.items.length} purchased item(s)!`);
  };

  // Filter orders by current tab and search query
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerDetails.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'processing') return order.status === 'processing';
    if (activeTab === 'shipped_delivered') return order.status === 'shipped' || order.status === 'delivered';
    return true;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const shippedDeliveredCount = orders.filter((o) => o.status === 'shipped' || o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-brand-600" />
            <span>Order Management Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time order fulfillment & shipment booking state machine
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search Order ID, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500 shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
            activeTab === 'pending'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50 dark:bg-brand-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Tab 1: New Orders</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('processing')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
            activeTab === 'processing'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50 dark:bg-brand-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tab 2: Ready to Ship</span>
          {processingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">
              {processingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('shipped_delivered')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
            activeTab === 'shipped_delivered'
              ? 'border-brand-600 text-brand-600 bg-brand-50/50 dark:bg-brand-950/30'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Tab 3: Shipped & Delivered</span>
          {shippedDeliveredCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
              {shippedDeliveredCount}
            </span>
          )}
        </button>
      </div>

      {/* Orders View */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading orders live feed...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No orders found in this status</p>
          <p className="text-xs text-slate-400 mt-1">Place a test order from the storefront checkout page!</p>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (CARDS): block md:hidden */}
          <div className="block md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID</span>
                    <h4 className="text-sm font-mono font-bold text-slate-900 dark:text-white">#{order.id}</h4>
                  </div>
                  <StatusPill status={order.status} />
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{order.customerDetails.name}</p>
                  <p className="text-slate-500">{order.customerDetails.email} • {order.customerDetails.phone}</p>
                  <p className="text-slate-400 truncate">{order.customerDetails.address}, {order.customerDetails.city}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Items ({order.items.length}):
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                      <span>{item.quantity}x {item.title}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span className="text-brand-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Courier details if shipped */}
                {order.courierName && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-brand-50/50 p-2 rounded-lg">
                    <strong>Courier:</strong> {order.courierName} | <strong>Tracking:</strong> {order.trackingNumber}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {order.status === 'processing' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenShipmentModal(order)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Book Shipment & Add Tracking</span>
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Delivered</span>
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleTriggerReviewEmail(order)}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-600" />
                      <span>Trigger Review Email Mock</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW (STRUCTURED TABLE): hidden md:block */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="px-6 py-4">Order ID & Date</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Line Items</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Order ID */}
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">#{order.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{order.customerDetails.name}</div>
                        <div className="text-slate-500 text-[11px]">{order.customerDetails.email}</div>
                        <div className="text-slate-400 text-[10px] truncate max-w-[180px]">
                          {order.customerDetails.address}, {order.customerDetails.city}
                        </div>
                      </td>

                      {/* Line Items */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] font-medium truncate">
                              <span className="text-brand-600 font-bold">{it.quantity}x</span> {it.title}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        {order.discountApplied > 0 && (
                          <div className="text-[10px] text-emerald-600">
                            -${order.discountApplied.toFixed(2)} discount
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusPill status={order.status} />
                        {order.courierName && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {order.courierName}: {order.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {order.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAcceptOrder(order.id)}
                              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {order.status === 'processing' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenShipmentModal(order)}
                              className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Book Shipment</span>
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {order.status === 'shipped' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrderForLabel(order)}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] rounded-lg transition-colors shadow-sm inline-flex items-center gap-1"
                              title="Download/Print Shipping Label & Tax Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Label</span>
                            </button>
                            <button
                              onClick={() => handleMarkDelivered(order.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors shadow-sm"
                            >
                              Mark Delivered
                            </button>
                            {order.trackingUrl && (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-400 hover:text-brand-600"
                                title="View Tracking Link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        )}

                        {order.status === 'delivered' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrderForLabel(order)}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] rounded-lg transition-colors shadow-sm inline-flex items-center gap-1"
                              title="Download/Print Shipping Label & Tax Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Label & Invoice</span>
                            </button>
                            <button
                              onClick={() => handleTriggerReviewEmail(order)}
                              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-[11px] rounded-lg transition-colors border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5 text-brand-600" />
                              <span>Review Mail</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* BOOK SHIPMENT MODAL */}
      {selectedOrderForShipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setSelectedOrderForShipment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Book Shipment & Add Tracking
                </h3>
                <p className="text-xs text-slate-500 font-mono">Order #{selectedOrderForShipment.id}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitShipment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Courier Partner Name
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="FedEx Express">FedEx Express</option>
                  <option value="DHL Worldwide Express">DHL Worldwide Express</option>
                  <option value="UPS Next Day Air">UPS Next Day Air</option>
                  <option value="Blue Dart Logistics">Blue Dart Logistics</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRK-9847102938"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Public Courier Tracking URL
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://www.fedex.com/tracking"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForShipment(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShipment}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch & Ship</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHIPPING LABEL & INVOICE MODAL */}
      {selectedOrderForLabel && (
        <ShippingLabelModal
          order={selectedOrderForLabel}
          onClose={() => setSelectedOrderForLabel(null)}
        />
      )}
    </div>
  );
};

function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-300' },
    processing: { label: 'Processing', className: 'bg-brand-100 text-brand-800 border-brand-300' },
    shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800 border-purple-300' },
    delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-800 border-rose-300' },
  };

  const current = map[status] || map.pending;

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${current.className}`}>
      {current.label}
    </span>
  );
}
