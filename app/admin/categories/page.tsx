'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Category } from '@/types/ecommerce';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/firestoreServices';
import { Sparkles, Plus, X, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      description: description.trim()
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success(`Category "${name}" updated!`);
      } else {
        await createCategory(payload);
        toast.success(`Category "${name}" created!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save category.');
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      try {
        await deleteCategory(id);
        toast.success(`Category "${catName}" deleted!`);
        fetchData();
      } catch (error) {
        toast.error('Failed to delete category.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <span>Category Manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Organize products into curated storefront collections</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat: Category) => (
          <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3 relative group">
            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image src={cat.image} alt={cat.name} fill className="object-cover" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
              <div className="text-[10px] font-mono text-brand-600 font-bold mt-2">slug: {cat.slug}</div>
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

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Wearables"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold">Category Image</label>
                <ImageUploader
                  onImageUploaded={(url) => {
                    if (url) setImage(url);
                  }}
                />
                <input
                  type="url"
                  placeholder="Or paste HTTPS image URL"
                  value={image}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-2"
                />
                {image && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden mt-2 border border-slate-200">
                    <Image src={image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-xs font-bold rounded-xl dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
