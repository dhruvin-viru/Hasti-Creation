'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/types/ecommerce';

interface FeaturedCategoriesProps {
  categories: Category[];
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categories }) => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Collections
          </h2>
          <p className="text-xs text-slate-500 mt-1">Handpicked categories tailored for your style & technology needs</p>
        </div>
        <Link 
          href="/products" 
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="group relative h-48 md:h-60 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <Image
              src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
              alt={cat.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
            
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
              <h3 className="text-base md:text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-light">
                {cat.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
