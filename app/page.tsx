import React from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/store/HeroBanner';
import { FeaturedCategories } from '@/components/store/FeaturedCategories';
import { ProductCard } from '@/components/store/ProductCard';
import { getActiveBanners, getCategories, getProducts } from '@/lib/firestoreServices';
import { ArrowRight, Flame, Sparkles, ShieldCheck, Zap, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([
    getActiveBanners(),
    getCategories(),
    getProducts()
  ]);

  const featuredProducts = products.filter(p => p.isFeatured || p.stock > 0).slice(0, 8);
  const flashDeals = products.filter(p => p.discountPrice && p.discountPrice < p.price);

  return (
    <div className="space-y-12">
      {/* Dynamic Hero Banner Carousel */}
      {banners.length > 0 && <HeroBanner banners={banners} />}

      {/* Featured Categories */}
      {categories.length > 0 && <FeaturedCategories categories={categories} />}

      {/* Flash Deals / Special Discounts Section */}
      {flashDeals.length > 0 && (
        <section className="bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-rose-900/40 shadow-2xl text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-glow">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Limited Time Flash Deals
                </h2>
                <p className="text-xs text-rose-200">Exclusive discount pricing while stocks last</p>
              </div>
            </div>

            <Link
              href="/products?filter=deals"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors w-max"
            >
              <span>Explore All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashDeals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Products Catalog */}
      <section className="py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Trending & Popular Gear</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">High performance gear selected by our community</p>
          </div>

          <Link 
            href="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <PlusCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Firestore Database Connected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your Firestore database is active! Add products, categories, coupons and hero banners from the Admin Panel.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-full shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Products in Admin</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
