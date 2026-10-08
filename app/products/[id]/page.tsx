'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProductById } from '@/lib/firestoreServices';
import { Product } from '@/types/ecommerce';
import { useCartStore } from '@/store/useCartStore';
import { ReviewSection } from '@/components/store/ReviewSection';
import { 
  Star, 
  ShoppingBag, 
  CheckCircle2, 
  Shield, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 space-y-6 max-w-5xl mx-auto">
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-full">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const price = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity}x "${product.title}" to your cart!`);
  };

  return (
    <div className="py-6 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-slate-600">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 dark:text-white font-semibold line-clamp-1 max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 dark:border-slate-800 shadow-md">
            <Image
              src={product.images[activeImageIndex] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
              alt={product.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    index === activeImageIndex
                      ? 'border-brand-600 scale-105 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Specs */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 mb-2">
              {product.categoryName || 'Premium Product'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {product.title}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-1">
                  {product.rating ? product.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-slate-400 ml-1">({product.reviewCount || 0} reviews)</span>
              </div>

              <div className="h-4 w-px bg-slate-200" />

              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> {product.stock} Units In Stock
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-600">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-base text-slate-400 line-through">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>
            {hasDiscount && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-accent-600 text-white uppercase">
                Save ${(product.price - price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Features Checklist */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Key Highlights:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-xl"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-800 dark:text-slate-200">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Shopping Cart</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <RotateCcw className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>1-Day Return</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <Shield className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>COD Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <ReviewSection productId={product.id} />
    </div>
  );
}
