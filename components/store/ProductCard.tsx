'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();

  const price = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`Added "${product.title}" to your cart!`);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1">
      {/* Product Image Container */}
      <Link href={`/products/${product.id}`} className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800/80 overflow-hidden block">
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-accent-600 to-rose-600 text-white shadow-sm uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow-indigo uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> FEATURED
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600/90 text-white backdrop-blur-md shadow-sm">
              <AlertCircle className="w-3 h-3" /> Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
            {product.categoryName || 'General Gear'}
          </div>

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {/* Star Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                ({product.reviewCount || 12})
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Verified
            </span>
          </div>

          {/* Price & Add Button */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                ${price.toFixed(2)}
              </div>
              {hasDiscount && (
                <div className="text-xs text-slate-400 line-through font-medium">
                  ${product.price.toFixed(2)}
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-brand-600 dark:hover:bg-brand-500 text-white dark:text-slate-900 dark:hover:text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition-all transform active:scale-95 shadow-md"
              aria-label="Add product to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
