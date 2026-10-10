'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import { createOrder, validateCoupon } from '@/lib/firestoreServices';
import { ShoppingBag, Tag, Check, ShieldCheck, CreditCard, Truck, ArrowRight, Lock, UserCheck, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getTotalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCartStore();

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Gujarat',
    zipCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod'>('prepaid');

  useEffect(() => {
    if (user) {
      setCustomerDetails((prev) => ({
        ...prev,
        name: prev.name || user.displayName || user.email?.split('@')[0] || '',
        email: user.email || prev.email || '',
      }));
    }
  }, [user]);

  const [couponInput, setCouponInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const baseTotal = getTotalAmount();

  // Dynamic Shipping Charge Rules:
  // Prepaid: Gujarat = ₹60, Other States = ₹120
  // COD = ₹160 fixed charge
  const calculateShippingFee = () => {
    if (paymentMethod === 'cod') return 160;
    const st = (customerDetails.state || '').trim().toLowerCase();
    if (st === 'gujarat') return 60;
    return 120;
  };

  const shippingFee = calculateShippingFee();
  const total = Math.max(0, baseTotal + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    const res = await validateCoupon(couponInput, subtotal);
    setValidatingCoupon(false);

    if (res.valid && res.coupon) {
      applyCoupon(res.coupon);
      toast.success(res.message);
      setCouponInput('');
    } else {
      toast.error(res.message);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Login required! Please sign in to place your order.');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setSubmittingOrder(true);
    toast.loading('Creating order in Firestore...', { id: 'order' });

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
        image: item.selectedImage || item.product.images[0] || '',
        sku: item.product.sku || `HC-SKU-${item.product.id.substring(0, 6).toUpperCase()}`,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        gstRate: item.product.gstRate ?? 5
      }));

      const orderId = await createOrder({
        userId: user.uid,
        customerDetails,
        items: orderItems,
        subtotal,
        discountApplied: discount,
        couponCode: appliedCoupon?.code,
        shippingFee,
        paymentMethod,
        totalAmount: total,
      });

      toast.success('Order placed successfully!', { id: 'order' });
      clearCart();
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order. Please try again.', { id: 'order' });
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold">No items in checkout</h2>
        <button onClick={() => router.push('/products')} className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-full">
          Return to Shop
        </button>
      </div>
    );
  }

  // Customer Login Requirement Screen
  if (!user && !loading) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-md">
          <LogIn className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Login Required
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You must be logged in to place an order and track real-time delivery status.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <Link
            href="/login"
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In / Create Account to Place Order</span>
          </Link>

          <p className="text-[11px] text-slate-400">
            Cart items will be preserved after signing in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Lock className="w-6 h-6 text-brand-600" />
          <span>Secure Checkout</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Complete your order details below</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Customer Info Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>1. Shipping & Customer Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="Surat"
                  value={customerDetails.city}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  required
                  placeholder="Gujarat"
                  value={customerDetails.state}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="123 Commerce St, Suite 100"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span>2. Payment Option</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('prepaid')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'prepaid'
                    ? 'bg-brand-50/80 border-brand-500 dark:bg-brand-950/50 ring-2 ring-brand-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  paymentMethod === 'prepaid' ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-400'
                }`}>
                  {paymentMethod === 'prepaid' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Prepaid Order</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {customerDetails.state?.trim().toLowerCase() === 'gujarat' ? '₹60 Delivery' : '₹120 Delivery'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Gujarat: ₹60 shipping | Outside Gujarat: ₹120 shipping
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-brand-50/80 border-brand-500 dark:bg-brand-950/50 ring-2 ring-brand-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  paymentMethod === 'cod' ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-400'
                }`}>
                  {paymentMethod === 'cod' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Cash on Delivery</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      ₹160 Charge
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Fixed ₹160 COD delivery charge
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Order Items & Totals Summary Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Cart Review ({items.length})
          </h2>

          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const imgUrl = item.selectedImage || item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
              return (
                <div key={`${item.product.id}-${idx}`} className="flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    <Image src={imgUrl} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 truncate">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{item.product.title}</h4>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                      <span>{item.quantity}x @ ₹{item.product.discountPrice || item.product.price}</span>
                      {item.selectedColor && <span className="text-brand-600 font-bold">• {item.selectedColor}</span>}
                      {item.selectedSize && <span className="font-bold">• Size: {item.selectedSize}</span>}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    ₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Input */}
          <div>
            {appliedCoupon ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Code {appliedCoupon.code} Applied
                </span>
                <button type="button" onClick={removeCoupon} className="text-emerald-700 hover:underline text-[11px] font-bold">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponInput.trim()}
                  className="px-3.5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <span>Shipping Charge</span>
                <span className="text-[10px] text-slate-400">
                  ({paymentMethod === 'cod' ? 'COD' : customerDetails.state?.trim().toLowerCase() === 'gujarat' ? 'Gujarat' : 'Interstate'})
                </span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">₹{shippingFee.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total Pay</span>
              <span className="text-xl text-brand-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingOrder}
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <span>Place Order Now (₹{total.toFixed(2)})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-1">
            <div className="text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Free Return Shipping Guaranteed</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Wrong or defective items can be returned with 100% free return shipping paid by us.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
