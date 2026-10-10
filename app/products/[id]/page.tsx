'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProductById, createStockNotification } from '@/lib/firestoreServices';
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
  ChevronRight,
  Bell,
  X,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Notify Me Modal State
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      if (data) {
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colorVariants && data.colorVariants.length > 0) {
          setSelectedColor(data.colorVariants[0].colorName);
        }
      }
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
  const isOutOfStock = product.stock <= 0;

  // Determine active images array based on selected color variant
  const activeColorVariant = product.colorVariants?.find(
    (cv) => cv.colorName.toLowerCase() === selectedColor.toLowerCase()
  );
  const displayImages = (activeColorVariant && activeColorVariant.images && activeColorVariant.images.length > 0)
    ? activeColorVariant.images
    : (product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e']);

  const activeImage = displayImages[activeImageIndex] || displayImages[0];

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    setActiveImageIndex(0); // Reset gallery to first image of new color
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size first');
      return;
    }
    if (product.colorVariants && product.colorVariants.length > 0 && !selectedColor) {
      toast.error('Please select a color first');
      return;
    }
    addItem(product, quantity, selectedSize || undefined, selectedColor || undefined, activeImage);
    toast.success(`Added ${quantity}x "${product.title}" (${selectedColor ? selectedColor + ' ' : ''}${selectedSize ? 'Size: ' + selectedSize : ''}) to cart!`);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Please enter your name and contact phone number');
      return;
    }

    setIsSubmittingNotify(true);
    try {
      await createStockNotification({
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0] || '',
        productSku: product.sku || `HC-SKU-${product.id.substring(0, 6).toUpperCase()}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined
      });

      toast.success(`Request submitted! We will alert you on WhatsApp/Phone when "${product.title}" is back in stock.`);
      setShowNotifyModal(false);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
    } catch (error) {
      toast.error('Failed to submit restock notification request.');
    } finally {
      setIsSubmittingNotify(false);
    }
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
              src={activeImage}
              alt={product.title}
              fill
              priority
              className="object-cover"
            />
            {selectedColor && (
              <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                Color: {selectedColor}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {displayImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    index === activeImageIndex
                      ? 'border-brand-600 scale-105 shadow-md ring-2 ring-brand-500/30'
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
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {product.categoryName || 'Premium Product'}
              </span>
              {product.sku && (
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  SKU: {product.sku}
                </span>
              )}
            </div>

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

              {!isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> {product.stock} Units In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-base text-slate-400 line-through">₹{product.price.toFixed(2)}</span>
                )}
              </div>
            </div>
            {hasDiscount && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-accent-600 text-white uppercase">
                Save ₹{(product.price - price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Color Variants Swatches */}
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div className="space-y-2.5 p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Color Option: <strong className="text-brand-600 dark:text-brand-400">{selectedColor || 'Select Color'}</strong>
                </span>
                <span className="text-[10px] text-slate-400">Click to view color images</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colorVariants.map((cv) => {
                  const isSelected = selectedColor.toLowerCase() === cv.colorName.toLowerCase();
                  return (
                    <button
                      key={cv.id}
                      type="button"
                      onClick={() => handleColorSelect(cv.colorName)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-brand-600 ring-2 ring-brand-500/20 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 shadow-inner"
                        style={{ backgroundColor: cv.colorHex || '#94a3b8' }}
                      />
                      <span>{cv.colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Variants Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5 p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Size: <strong className="text-brand-600 dark:text-brand-400">{selectedSize || 'Select Size'}</strong>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[42px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-500/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* Action Buttons: Add to Cart OR Notify Me when Out of Stock */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            {!isOutOfStock ? (
              <>
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
                  className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Shopping Cart</span>
                </button>
              </>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                  <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span>Currently Out of Stock!</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  This product is temporarily unavailable. Request a restock notification and we will contact you directly on WhatsApp / Phone as soon as it goes live!
                </p>
                <button
                  onClick={() => setShowNotifyModal(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When In Stock</span>
                </button>
              </div>
            )}
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

      {/* NOTIFY ME WHEN IN STOCK MODAL */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setShowNotifyModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white pt-2">
                Notify Me When In Stock
              </h3>
              <p className="text-xs text-slate-500">
                Enter your details to get an instant alert when <span className="font-bold text-slate-700 dark:text-slate-300">"{product.title}"</span> is back in stock.
              </p>
            </div>

            <form onSubmit={handleNotifySubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNotify}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNotify ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verified Reviews Section */}
      <ReviewSection productId={product.id} />
    </div>
  );
}
