'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Banner } from '@/types/ecommerce';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '@/lib/firestoreServices';
import { Image as ImageIcon, Plus, X, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/products');
  const [tag, setTag] = useState('NEW ARRIVAL');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllBanners();
    setBanners(data);
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setLinkUrl('/products');
    setTag('NEW ARRIVAL');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl || '');
    setLinkUrl(b.linkUrl || '/products');
    setTag(b.tag || '');
    setActive(b.active ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error('Banner headline and image are required.');
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim(),
      active,
      tag: tag.trim()
    };

    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload);
        toast.success(`Banner "${title}" updated!`);
      } else {
        await createBanner(payload);
        toast.success(`Banner "${title}" created!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save banner.');
    }
  };

  const handleDelete = async (id: string, bTitle: string) => {
    if (confirm(`Are you sure you want to delete banner "${bTitle}"?`)) {
      try {
        await deleteBanner(id);
        toast.success(`Banner "${bTitle}" deleted!`);
        fetchData();
      } catch (error) {
        toast.error('Failed to delete banner.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            <span>Hero Banner Carousel Manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Control active promotional hero slides on the main homepage. If 3 or more banners are active, they play as an infinite carousel.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b: Banner) => (
          <div key={b.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3 relative overflow-hidden group">
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900">
              <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-75" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-slate-950/80 to-transparent">
                {b.tag && <span className="text-[10px] font-bold text-amber-400 uppercase">{b.tag}</span>}
                <h3 className="text-base font-extrabold text-white">{b.title}</h3>
                <p className="text-xs text-slate-300">{b.subtitle}</p>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl">
                <button
                  onClick={() => handleOpenEditModal(b)}
                  className="p-1.5 text-white hover:text-brand-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id, b.title)}
                  className="p-1.5 text-white hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-500 flex justify-between font-mono items-center">
              <span className="truncate max-w-[200px]">Target Link: {b.linkUrl}</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                b.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {b.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingBanner ? 'Edit Hero Banner Slide' : 'Add Hero Banner Slide'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Banner Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-Gen Noise Cancellation"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Subheadline Description</label>
                <input
                  type="text"
                  placeholder="e.g. 40h Battery life with fast charge"
                  value={subtitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tag / Promo Label</label>
                <input
                  type="text"
                  placeholder="e.g. 20% OFF TODAY"
                  value={tag}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTag(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold">Background Banner Image</label>
                <ImageUploader
                  onImageUploaded={(url) => {
                    if (url) setImageUrl(url);
                  }}
                />
                <input
                  type="url"
                  required
                  placeholder="Or paste HTTPS image URL"
                  value={imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-2"
                />
                {imageUrl && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden mt-2 border border-slate-200">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Destination Target Link</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold cursor-pointer">
                  Active Banner Slide (visible in Homepage Carousel)
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-xs font-bold rounded-xl dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">
                  {editingBanner ? 'Update Banner' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
