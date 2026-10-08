'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Banner } from '@/types/ecommerce';

interface HeroBannerProps {
  banners: Banner[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners.length) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative w-full h-[460px] md:h-[540px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800/80 my-6 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {/* Background Image with Dark Gradient Overlay */}
          <Image
            src={current.imageUrl}
            alt={current.title}
            fill
            priority
            className="object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />

          {/* Banner Content */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-12 md:pb-16 z-10">
            {current.tag && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-brand-600 to-accent-600 text-white w-max mb-4 shadow-glow-indigo backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>{current.tag}</span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-2xl drop-shadow-xl"
            >
              {current.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm md:text-lg text-slate-300 mt-3 max-w-xl font-medium leading-relaxed"
            >
              {current.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center gap-4"
            >
              <Link
                href={current.linkUrl || '/products'}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-sm shadow-glow-indigo transition-all transform hover:scale-105 active:scale-95"
              >
                <span>Shop Collection Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/10"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/10"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Dot Indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-brand-500 shadow-glow-indigo' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
