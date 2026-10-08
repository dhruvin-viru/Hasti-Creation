"use client";

import { useState } from "react";
import { uploadProductImage } from "@/lib/uploadImage";
import Image from "next/image";
import { Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  initialUrl?: string;
}

export default function ImageUploader({ onImageUploaded, initialUrl }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // Upload directly to Cloudinary
      const url = await uploadProductImage(file);
      setPreviewUrl(url);
      onImageUploaded(url); // Pass URL to parent form state
      toast.success("Image uploaded to Cloudinary successfully!");
    } catch (error: any) {
      console.error("Cloudinary image upload failed:", error);
      toast.error(error?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Product Image (Cloudinary Unsigned Upload)
      </label>

      {/* Preview Box */}
      {previewUrl && (
        <div className="relative w-40 h-40 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 shadow-inner group">
          <Image src={previewUrl} alt="Product Preview" fill className="object-cover" />
          <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Input File Button */}
      <div className="relative">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={uploading} 
          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-950 dark:file:text-brand-300 disabled:opacity-50 cursor-pointer" 
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-brand-600 font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading directly to Cloudinary...</span>
        </div>
      )}
    </div>
  );
}
