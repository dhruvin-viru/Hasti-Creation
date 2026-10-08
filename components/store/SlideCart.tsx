'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Check } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { validateCoupon } from '@/lib/firestoreServices';
import toast from 'react-hot-toast';

export const SlideCart: React.FC = () => {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
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

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Cart</h2>
                    <p className="text-xs text-slate-500">{items.length} {items.length === 1 ? 'item' : 'items'} selected</p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Your cart is empty</h3>
                    <p className="text-xs text-slate-500 mb-6 max-w-xs">Explore our premium store collection and add your favorite items!</p>
                    <button
                      onClick={closeCart}
                      className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-xs rounded-full hover:bg-brand-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800 relative group"
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-slate-200">
                          <Image
                            src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 pr-6">
                              {item.product.title}
                            </h4>
                            <p className="text-xs font-bold text-brand-600 mt-1">
                              ₹{price.toFixed(2)}
                              {item.product.discountPrice && (
                                <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">
                                  ₹{item.product.price.toFixed(2)}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 rounded-l-lg"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 rounded-r-lg"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Summary & Coupon Section */}
              {items.length > 0 && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 space-y-4">
                  {/* Coupon Code Engine */}
                  <div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Code <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountType === 'percent' ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} FLAT`})</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-emerald-700 hover:underline text-[11px] font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Coupon (e.g. WELCOME10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 uppercase focus:border-brand-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={validating || !couponInput.trim()}
                          className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount Applied</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Shipping Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                      <span>Total Amount</span>
                      <span className="text-base text-brand-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform active:scale-95"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
