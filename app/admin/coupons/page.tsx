'use client';

import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types/ecommerce';
import { getCoupons, createCoupon } from '@/lib/firestoreServices';
import { Tag, Plus, CheckCircle, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [value, setValue] = useState('15');
  const [minOrderAmount, setMinOrderAmount] = useState('75');
  const [maxUses, setMaxUses] = useState('200');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCoupons();
    setCoupons(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        value: parseFloat(value),
        minOrderAmount: parseFloat(minOrderAmount),
        maxUses: parseInt(maxUses, 10),
        active: true,
        expiryDate
      });
      toast.success(`Coupon "${code.toUpperCase()}" generated!`);
      setIsModalOpen(false);
      setCode('');
      fetchData();
    } catch (error) {
      toast.error('Failed to create coupon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-600" />
            <span>Offer & Coupon Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure percentage & flat discount codes with usage thresholds</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c: Coupon) => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-brand-100 text-brand-800 border border-brand-200">
                {c.code}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Active
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {c.discountType === 'percent' ? `${c.value}% OFF` : `$${c.value} FLAT OFF`}
              </div>
              <p className="text-xs text-slate-400 mt-1">Min Order: ${c.minOrderAmount}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>Uses: <strong>{c.usedCount || 0}</strong> / {c.maxUses}</div>
              <div className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" /> Exp: {c.expiryDate}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Discount Code</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH50"
                  value={code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDiscountType(e.target.value as 'percent' | 'flat')}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    required
                    value={minOrderAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    required
                    value={maxUses}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxUses(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-xs font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
