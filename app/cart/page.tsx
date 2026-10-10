'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { validateCoupon } from '@/lib/firestoreServices';
import { ShoppingBag, Trash2, Plus, Minus, Tag, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTotalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [validating, setValidating] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const total = getTotalAmount();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidating(true);
    const res = await validateCoupon(couponInput, subtotal);
    setValidating(false);

    if (res.valid && res.coupon) {
      applyCoupon(res.coupon);
      toast.success(res.message);
      setCouponInput('');
    } else {
      toast.error(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500">Discover our high performance gear and add items to your cart.</p>
        <Link href="/products" className="inline-block px-6 py-3 bg-brand-600 text-white font-bold text-xs rounded-full shadow-lg">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">{items.length} unique item(s) in your bag</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => {
            const price = item.product.discountPrice || item.product.price;
            const itemImage = item.selectedImage || item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
            const itemKey = `${item.product.id}-${item.selectedSize || 'nosize'}-${item.selectedColor || 'nocolor'}-${idx}`;

            return (
              <div
                key={itemKey}
                className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <Image
                    src={itemImage}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.product.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{item.product.categoryName}</p>
                      
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.selectedColor && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-l-xl"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-r-xl"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{(price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400">₹{price.toFixed(2)} each</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Order Summary
          </h2>

          {/* Coupon Code Verification Engine */}
          <div>
            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Code <strong>{appliedCoupon.code}</strong> Active</span>
                </div>
                <button onClick={removeCoupon} className="text-emerald-700 hover:underline font-bold text-[11px]">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase focus:outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={validating || !couponInput.trim()}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total Pay</span>
              <span className="text-lg text-brand-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-colors"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted & Safe Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
