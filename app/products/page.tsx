'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/store/ProductCard';
import { getProducts, getCategories } from '@/lib/firestoreServices';
import { Product, Category } from '@/types/ecommerce';
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filtering Logic
  const filteredProducts = products.filter((prod) => {
    const price = prod.discountPrice || prod.price;

    if (selectedCategory !== 'all') {
      const matchedCat = categories.find(
        (c) => c.id === selectedCategory || c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
      );
      const categoryIdToMatch = matchedCat ? matchedCat.id : selectedCategory;
      if (prod.categoryId !== categoryIdToMatch) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prod.title.toLowerCase().includes(q);
      const matchDesc = prod.description ? prod.description.toLowerCase().includes(q) : false;
      const matchSku = prod.sku ? prod.sku.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchDesc && !matchSku) return false;
    }

    if (price > maxPrice) return false;

    if (inStockOnly && prod.stock <= 0) return false;

    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(100000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {sortedProducts.length} items from premium inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="md:hidden px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="featured">Featured & Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:block md:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filter Products</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Search Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Max Price:</span>
              <span className="text-brand-600 font-bold">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="100"
              max="100000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              In-Stock Only
            </label>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>
        </aside>

        {/* MOBILE FILTER MODAL */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex justify-end md:hidden">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xs h-full rounded-2xl p-6 shadow-2xl space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-sm">Filter Products</h3>
                <button onClick={() => setShowMobileFilter(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedCategory('all'); setShowMobileFilter(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${selectedCategory === 'all' ? 'bg-brand-50 text-brand-700 font-bold' : ''}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setShowMobileFilter(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${selectedCategory === cat.id ? 'bg-brand-50 text-brand-700 font-bold' : ''}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">Max Price (₹{maxPrice.toLocaleString('en-IN')})</label>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* PRODUCTS GRID */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No products match your filter criteria</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing filters or adjusting your price slider.</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-full hover:bg-brand-500 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-semibold text-slate-400">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
