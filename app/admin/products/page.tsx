'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types/ecommerce';
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage 
} from '@/lib/firestoreServices';
import { Plus, Trash2, Edit3, Grid, Search, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('10');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [description, setDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [gstRate, setGstRate] = useState('5');
  const [isUploading, setIsUploading] = useState(false);

  // Variant States (Sizes & Color Variants)
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [colorVariants, setColorVariants] = useState<{ id: string; colorName: string; colorHex?: string; images: string[] }[]>([]);
  const [currentColorName, setCurrentColorName] = useState('');
  const [currentColorHex, setCurrentColorHex] = useState('#3b82f6');
  const [currentColorImages, setCurrentColorImages] = useState<string[]>([]);
  const [currentColorInputUrl, setCurrentColorInputUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
    if (cats.length > 0) setCategoryId(cats[0].id);
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setTitle('');
    // Auto-generate suggested unique SKU
    const suggestedSku = 'HC-SKU-' + Math.floor(1000 + Math.random() * 9000);
    setSku(suggestedSku);
    setPrice('1499');
    setDiscountPrice('1199');
    setStock('15');
    setGstRate('5');
    setImagesList(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e']);
    setInputUrl('');
    setDescription('High performance audio gear built with premium materials.');
    setFeaturesStr('Noise Cancellation, 40h Battery, Bluetooth 5.3');
    setIsFeatured(true);
    setSizes(['S', 'M', 'L', 'XL', 'Free Size']);
    setColorVariants([]);
    setCurrentColorName('');
    setCurrentColorHex('#3b82f6');
    setCurrentColorImages([]);
    setCurrentColorInputUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setSku(prod.sku || `HC-SKU-${prod.id.substring(0, 6).toUpperCase()}`);
    setPrice(prod.price.toString());
    setDiscountPrice(prod.discountPrice ? prod.discountPrice.toString() : '');
    setCategoryId(prod.categoryId);
    setStock(prod.stock.toString());
    setGstRate(prod.gstRate ? prod.gstRate.toString() : '5');
    setImagesList(prod.images && prod.images.length > 0 ? prod.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e']);
    setInputUrl('');
    setDescription(prod.description);
    setFeaturesStr(prod.features ? prod.features.join(', ') : '');
    setIsFeatured(Boolean(prod.isFeatured));
    setSizes(prod.sizes || []);
    setColorVariants(prod.colorVariants || []);
    setCurrentColorName('');
    setCurrentColorHex('#3b82f6');
    setCurrentColorImages([]);
    setCurrentColorInputUrl('');
    setIsModalOpen(true);
  };

  const handleAddImage = (urlToAdd: string) => {
    if (!urlToAdd.trim()) return;
    setImagesList((prev) => [...prev, urlToAdd.trim()]);
    setInputUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter(s => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleAddCustomSize = () => {
    const s = newSizeInput.trim();
    if (!s) return;
    if (!sizes.includes(s)) {
      setSizes([...sizes, s]);
    }
    setNewSizeInput('');
  };

  const handleAddColorVariant = () => {
    if (!currentColorName.trim()) {
      toast.error('Please enter a color name (e.g. Red, Royal Blue)');
      return;
    }
    if (currentColorImages.length === 0) {
      toast.error('Please add at least 1 image for this color variant');
      return;
    }

    const newVariant = {
      id: 'col-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      colorName: currentColorName.trim(),
      colorHex: currentColorHex,
      images: [...currentColorImages]
    };

    setColorVariants(prev => [...prev, newVariant]);
    setCurrentColorName('');
    setCurrentColorHex('#3b82f6');
    setCurrentColorImages([]);
    setCurrentColorInputUrl('');
    toast.success(`Color variant "${newVariant.colorName}" added!`);
  };

  const handleRemoveColorVariant = (id: string) => {
    setColorVariants(prev => prev.filter(cv => cv.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      toast.error('Please enter product title and price');
      return;
    }

    if (!sku.trim()) {
      toast.error('Product SKU is mandatory!');
      return;
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check SKU uniqueness across products
    const duplicateSkuProduct = products.find(
      (p) => p.sku?.trim().toUpperCase() === cleanSku && p.id !== editingProduct?.id
    );

    if (duplicateSkuProduct) {
      toast.error(`SKU "${cleanSku}" is already assigned to "${duplicateSkuProduct.title}". SKU must be unique.`);
      return;
    }

    const catObj = categories.find(c => c.id === categoryId);
    const finalImages = imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'];

    const productPayload = {
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: cleanSku,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      categoryId,
      categoryName: catObj?.name || 'General',
      stock: parseInt(stock, 10) || 0,
      gstRate: parseFloat(gstRate) || 5,
      images: finalImages,
      description: description.trim(),
      features: featuresStr.split(',').map(f => f.trim()).filter(Boolean),
      rating: editingProduct ? editingProduct.rating : 4.8,
      reviewCount: editingProduct ? editingProduct.reviewCount : 12,
      isFeatured,
      sizes,
      colorVariants
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        toast.success(`Product "${title}" updated!`);
      } else {
        await createProduct(productPayload);
        toast.success(`Product "${title}" created with SKU ${cleanSku}!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save product.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success(`Deleted "${name}"`);
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product.');
      }
    }
  };

  const handleToggleStock = async (prod: Product) => {
    const newStock = prod.stock > 0 ? 0 : 20;
    await updateProduct(prod.id, { stock: newStock });
    toast.success(`Stock for "${prod.title}" updated to ${newStock}`);
    fetchData();
  };

  const filtered = products.filter((p: Product) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Grid className="w-5 h-5 text-brand-600" />
            <span>Product Inventory Manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Add, edit, toggle stock, and upload images to Firebase Storage</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* MOBILE CARDS: block md:hidden */}
      <div className="block md:hidden space-y-4">
        {filtered.map((prod: Product) => (
          <div key={prod.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
              <Image src={prod.images[0]} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.title}</h4>
              <div className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-bold my-0.5">
                SKU: {prod.sku || `HC-SKU-${prod.id.substring(0, 6).toUpperCase()}`}
              </div>
              <p className="text-[11px] text-slate-400">₹{prod.discountPrice || prod.price} • Stock: {prod.stock}</p>
              <button
                onClick={() => handleToggleStock(prod)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${prod.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
              >
                {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleOpenEditModal(prod)} className="p-1.5 text-slate-500 hover:text-brand-600">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(prod.id, prod.title)} className="p-1.5 text-slate-500 hover:text-rose-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE: hidden md:block */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-slate-500 tracking-wider">
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price / Discount</th>
              <th className="px-6 py-4">Stock Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((prod: Product) => (
              <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <Image src={prod.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{prod.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {prod.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                  <span className="bg-brand-50 dark:bg-brand-950/80 px-2 py-1 rounded-md border border-brand-200 dark:border-brand-800">
                    {prod.sku || `HC-SKU-${prod.id.substring(0, 6).toUpperCase()}`}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{prod.categoryName || 'General'}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900 dark:text-white">₹{(prod.discountPrice || prod.price).toFixed(2)}</span>
                  {prod.discountPrice && (
                    <span className="text-[10px] text-slate-400 line-through ml-1">₹{prod.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStock(prod)}
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      prod.stock > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {prod.stock > 0 ? `${prod.stock} In Stock` : 'Out of Stock'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(prod)}
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id, prod.title)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                    <span>Product SKU <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-brand-600 font-bold uppercase">Mandatory & Unique</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HC-SKU-1001"
                    value={sku}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 tracking-wider uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Standard Price (₹) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Discount Price (₹ optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                  >
                    {categories.map((c: Category) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="5"
                    value={gstRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGstRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Multiple Product Images Gallery Manager */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Product Images Gallery ({imagesList.length})
                </label>

                {/* Upload Image Button */}
                <ImageUploader
                  onImageUploaded={(url) => {
                    if (url) handleAddImage(url);
                  }}
                />

                {/* Direct Image URL Add Field */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value)}
                    placeholder="Paste image URL (e.g. Cloudinary/Unsplash)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(inputUrl)}
                    className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-colors flex-shrink-0"
                  >
                    Add Image URL
                  </button>
                </div>

                {/* Added Images Thumbnails Grid */}
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {imagesList.map((img, idx) => (
                      <div key={idx} className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group bg-white">
                        <Image src={img} alt={`Product Image ${idx + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Sizes Manager */}
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Available Sizes ({sizes.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        sizes.includes(sz)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {/* Custom size input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom size (e.g. 38, 40, 42)..."
                    value={newSizeInput}
                    onChange={(e) => setNewSizeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700"
                  >
                    + Size
                  </button>
                </div>
                {sizes.length > 0 && (
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-1 items-center pt-1">
                    <span>Active sizes:</span>
                    {sizes.map((s, idx) => (
                      <span key={idx} className="bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Variants & Color-Specific Images Manager */}
              <div className="space-y-3 p-3.5 bg-brand-50/50 dark:bg-slate-800/80 rounded-2xl border border-brand-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                    Color Variants & Linked Images ({colorVariants.length})
                  </label>
                  <span className="text-[10px] text-brand-600 font-bold">Each color has its own image set</span>
                </div>

                {/* List of existing Color Variants */}
                {colorVariants.length > 0 && (
                  <div className="space-y-2">
                    {colorVariants.map((cv) => (
                      <div key={cv.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-slate-300 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: cv.colorHex || '#ccc' }}
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{cv.colorName}</div>
                            <div className="text-[10px] text-slate-400">{cv.images.length} images attached</div>
                          </div>
                        </div>

                        {/* Thumbnail preview */}
                        <div className="flex items-center gap-1">
                          {cv.images.slice(0, 3).map((imgUrl, i) => (
                            <div key={i} className="relative w-7 h-7 rounded overflow-hidden border border-slate-200">
                              <Image src={imgUrl} alt="" fill className="object-cover" />
                            </div>
                          ))}
                          {cv.images.length > 3 && (
                            <span className="text-[9px] text-slate-400 font-bold">+{cv.images.length - 3}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveColorVariant(cv.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 ml-2"
                            title="Remove Color Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Color Variant Box */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Add New Color Variant</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Color Name (e.g. Royal Blue)</label>
                      <input
                        type="text"
                        placeholder="Color Name"
                        value={currentColorName}
                        onChange={(e) => setCurrentColorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Color Swatch</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={currentColorHex}
                          onChange={(e) => setCurrentColorHex(e.target.value)}
                          className="w-8 h-7 p-0 bg-transparent rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={currentColorHex}
                          onChange={(e) => setCurrentColorHex(e.target.value)}
                          className="w-full px-2 py-1.5 text-[10px] font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images upload for this color */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-500">
                      Images for {currentColorName || 'this color'} ({currentColorImages.length})
                    </label>
                    <ImageUploader
                      onImageUploaded={(url) => {
                        if (url) setCurrentColorImages(prev => [...prev, url]);
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Or paste color image URL..."
                        value={currentColorInputUrl}
                        onChange={(e) => setCurrentColorInputUrl(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (currentColorInputUrl.trim()) {
                            setCurrentColorImages(prev => [...prev, currentColorInputUrl.trim()]);
                            setCurrentColorInputUrl('');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-brand-600 text-white font-bold text-xs rounded-lg"
                      >
                        Add URL
                      </button>
                    </div>

                    {currentColorImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {currentColorImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200">
                            <Image src={imgUrl} alt="" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setCurrentColorImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddColorVariant}
                    className="w-full py-2 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    + Save Color Variant
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Features (comma separated)</label>
                <input
                  type="text"
                  value={featuresStr}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeaturesStr(e.target.value)}
                  placeholder="Feature 1, Feature 2"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsFeatured(e.target.checked)}
                />
                <label htmlFor="featured" className="text-xs font-semibold">Highlight on Homepage</label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
