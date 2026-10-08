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
  Printer,
  Plus,
  Edit2,
  Trash2,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStatus, CourierPartner } from '@/types/ecommerce';
import { 
  subscribeToOrders, 
  updateOrderStatus, 
  bookShipment,
  getCourierPartners,
  createCourierPartner,
  updateCourierPartner,
  deleteCourierPartner,
  DEFAULT_COURIERS
} from '@/lib/firestoreServices';
import { ShippingLabelModal } from './ShippingLabelModal';
import { BulkShippingLabelModal } from './BulkShippingLabelModal';
import toast from 'react-hot-toast';

export const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'shipped_delivered'>('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-Selection State for Bulk Label Generation
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [showBulkLabelModal, setShowBulkLabelModal] = useState(false);

  // Dynamic Courier Partners State
  const [courierPartners, setCourierPartners] = useState<CourierPartner[]>([]);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [editingCourierId, setEditingCourierId] = useState<string | null>(null);
  const [courierFormName, setCourierFormName] = useState('');
  const [courierFormUrl, setCourierFormUrl] = useState('');
  const [isSavingCourier, setIsSavingCourier] = useState(false);

  // Modal State for Booking Shipment & Printing Single Label
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<Order | null>(null);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSubmittingShipment, setIsSubmittingShipment] = useState(false);

  const fetchCouriers = async () => {
    try {
      const list = await getCourierPartners();
      setCourierPartners(list && list.length > 0 ? list : DEFAULT_COURIERS);
    } catch (err) {
      setCourierPartners(DEFAULT_COURIERS);
    }
  };

  useEffect(() => {
    // Real-time listener for orders collection
    const unsubscribe = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    fetchCouriers();

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
    const initialCourier = courierPartners.length > 0 ? courierPartners[0] : null;
    const initialName = initialCourier ? initialCourier.name : 'Delhivery';
    const initialUrl = initialCourier?.trackingUrlPattern || 'https://www.delhivery.com/track/package';

    setCourierName(initialName);
    setTrackingNumber('1490' + Math.floor(100000000000 + Math.random() * 900000000000));
    setTrackingUrl(initialUrl);
  };

  const handleCourierSelectChange = (name: string) => {
    setCourierName(name);
    const matched = courierPartners.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (matched && matched.trackingUrlPattern) {
      setTrackingUrl(matched.trackingUrlPattern);
    }
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

  // --- Courier Partner CRUD Handlers ---
  const handleSaveCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierFormName.trim()) {
      toast.error('Please enter a Courier Partner Name');
      return;
    }

    setIsSavingCourier(true);
    try {
      if (editingCourierId) {
        await updateCourierPartner(editingCourierId, {
          name: courierFormName.trim(),
          trackingUrlPattern: courierFormUrl.trim(),
        });
        toast.success('Courier partner updated!');
      } else {
        await createCourierPartner({
          name: courierFormName.trim(),
          trackingUrlPattern: courierFormUrl.trim(),
          active: true,
        });
        toast.success('New courier partner added!');
      }
      setCourierFormName('');
      setCourierFormUrl('');
      setEditingCourierId(null);
      await fetchCouriers();
    } catch (err) {
      toast.error('Failed to save courier partner.');
    } finally {
      setIsSavingCourier(false);
    }
  };

  const handleStartEditCourier = (courier: CourierPartner) => {
    setEditingCourierId(courier.id);
    setCourierFormName(courier.name);
    setCourierFormUrl(courier.trackingUrlPattern || '');
  };

  const handleCancelEditCourier = () => {
    setEditingCourierId(null);
    setCourierFormName('');
    setCourierFormUrl('');
  };

  const handleDeleteCourier = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove courier partner "${name}"?`)) {
      try {
        await deleteCourierPartner(id);
        toast.success(`Courier "${name}" removed.`);
        if (editingCourierId === id) {
          handleCancelEditCourier();
        }
        await fetchCouriers();
      } catch (err) {
        toast.error('Failed to remove courier partner.');
      }
    }
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

  // Multi-Selection Helper Functions
  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Orders
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCourierModal(true)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5 text-purple-600" />
            <span>Manage Couriers</span>
          </button>

          <a
            href="#help"
            onClick={(e) => { e.preventDefault(); toast.success('Order processing guide: 1. Click Accept -> 2. Click Book Shipment -> 3. Download/Print Label'); }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline"
          >
            <span className="w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold">▶</span>
            <span>Learn how to process your orders?</span>
          </a>

          <button
            onClick={() => setShowBulkLabelModal(true)}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Orders Data</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar (Supplier Hub Style) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm px-4 pt-3">
        <div className="flex items-center space-x-6 overflow-x-auto text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-purple-700 text-purple-700 dark:text-purple-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setActiveTab('processing')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'processing'
                ? 'border-purple-700 text-purple-700 dark:text-purple-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Ready to Ship ({processingCount})
          </button>

          <button
            onClick={() => setActiveTab('shipped_delivered')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'shipped_delivered'
                ? 'border-purple-700 text-purple-700 dark:text-purple-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Shipped & Delivered ({shippedDeliveredCount})
          </button>
        </div>

        {/* Secondary Filters Bar */}
        <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-400 font-medium">Filter by:</span>
            <select className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold focus:outline-none">
              <option>SLA Status</option>
              <option>Breaching Soon</option>
              <option>On Time</option>
            </select>
            <select className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold focus:outline-none">
              <option>Label downloaded</option>
              <option>Label Pending</option>
            </select>
            <select className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-semibold focus:outline-none">
              <option>All Filters</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search SKU ID, Order ID, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-purple-600 font-medium"
              />
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Syncing orders with database...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No orders found</p>
          <p className="text-xs text-slate-400 mt-1">There are no orders matching your selected tab or search query.</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded text-purple-700 focus:ring-purple-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 min-w-[220px]">Product Details</th>
                    <th className="py-3 px-3">Sub-order ID</th>
                    <th className="py-3 px-3">SKU ID</th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Dispatch Date / SLA</th>
                    <th className="py-3 px-3 text-right min-w-[150px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors ${
                        selectedOrderIds.includes(order.id) ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-3.5 h-3.5 rounded text-purple-700 focus:ring-purple-600 cursor-pointer"
                        />
                      </td>

                      {/* Product Details */}
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2.5">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img
                              src={order.items[0]?.image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {order.items[0]?.title || 'Product Item'}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Order ID: {order.orderId || order.id}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              Packet QR: {order.trackingNumber || `TP${order.id.substring(0, 10).toUpperCase()}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sub-order ID */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        {order.id}_1
                      </td>

                      {/* SKU ID */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        PS-{order.id.substring(0, 4).toUpperCase()}-1B
                      </td>

                      {/* Order ID */}
                      <td className="py-3 px-3 font-mono font-bold text-purple-700 dark:text-purple-400 text-[11px]">
                        {order.orderId || `#${order.id}`}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                      </td>

                      {/* Dispatch SLA */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            ⚠ Breaching Soon
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        {order.status === 'pending' && (
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => handleAcceptOrder(order.id)}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Order</span>
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-[11px] font-bold text-rose-600 hover:underline"
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}

                        {order.status === 'processing' && (
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => handleOpenShipmentModal(order)}
                              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>↓ Label</span>
                            </button>
                            <span className="text-[10px] font-bold text-emerald-600">Ready to Book</span>
                          </div>
                        )}

                        {order.status === 'shipped' && (
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForLabel(order)}
                              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>↓ Label</span>
                            </button>
                            <span className="text-[10px] font-bold text-emerald-600">Downloaded</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              🚚 {order.courierName || 'Delhivery'}
                            </span>
                          </div>
                        )}

                        {order.status === 'delivered' && (
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForLabel(order)}
                              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>↓ Label</span>
                            </button>
                            <span className="text-[10px] font-bold text-emerald-600">Delivered</span>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Courier Partner Name
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCourierModal(true)}
                    className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add / Manage Couriers</span>
                  </button>
                </div>

                <select
                  value={courierName}
                  onChange={(e) => handleCourierSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-medium"
                >
                  {courierPartners.map((courier) => (
                    <option key={courier.id} value={courier.name}>
                      {courier.name}
                    </option>
                  ))}
                  {/* Fallback option if user types custom name or empty list */}
                  {!courierPartners.some((c) => c.name.toLowerCase() === courierName.toLowerCase()) && courierName && (
                    <option value={courierName}>{courierName}</option>
                  )}
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
                  placeholder="https://www.delhivery.com/track/package"
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

      {/* MANAGE COURIER PARTNERS MODAL */}
      {showCourierModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => {
                setShowCourierModal(false);
                handleCancelEditCourier();
              }}
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
                  Manage Courier Partners
                </h3>
                <p className="text-xs text-slate-500">
                  Add, edit, or remove shipping & courier partners
                </p>
              </div>
            </div>

            {/* ADD / EDIT COURIER FORM */}
            <form onSubmit={handleSaveCourier} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {editingCourierId ? 'Edit Courier Partner' : 'Add New Courier Partner'}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Courier Partner Name *
                </label>
                <input
                  type="text"
                  value={courierFormName}
                  onChange={(e) => setCourierFormName(e.target.value)}
                  placeholder="e.g. Shadowfax, Xpressbees, DTDC, Aramex..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Default Tracking Web URL Pattern (Optional)
                </label>
                <input
                  type="url"
                  value={courierFormUrl}
                  onChange={(e) => setCourierFormUrl(e.target.value)}
                  placeholder="https://www.courier.com/track"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSavingCourier}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingCourierId ? 'Update Partner' : 'Add Partner'}</span>
                </button>

                {editingCourierId && (
                  <button
                    type="button"
                    onClick={handleCancelEditCourier}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* COURIERS LIST */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Available Courier Partners ({courierPartners.length})
              </h4>

              {courierPartners.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">
                  No custom courier partners added yet. Default options will be used.
                </p>
              ) : (
                courierPartners.map((courier) => (
                  <div
                    key={courier.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-brand-300 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {courier.name}
                      </h5>
                      {courier.trackingUrlPattern && (
                        <a
                          href={courier.trackingUrlPattern}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-brand-600 dark:text-brand-400 truncate block hover:underline"
                        >
                          {courier.trackingUrlPattern}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEditCourier(courier)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit Partner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourier(courier.id, courier.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remove Partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => {
                  setShowCourierModal(false);
                  handleCancelEditCourier();
                }}
                className="px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
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

      {/* BULK SHIPPING LABELS BATCH MODAL */}
      {showBulkLabelModal && (
        <BulkShippingLabelModal
          orders={selectedOrders}
          onClose={() => setShowBulkLabelModal(false)}
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
