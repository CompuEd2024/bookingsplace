'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface CloudinaryMediaUploaderProps {
  onUploadComplete: (url: string) => void;
  onRemove: (url: string) => void;
  existingUrls: string[];
}

export function CloudinaryMediaUploader({ onUploadComplete, onRemove, existingUrls }: CloudinaryMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      alert('Cloudinary configuration is missing. Please check your environment variables.');
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryUploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onUploadComplete(data.secure_url);
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-[32px] p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group
          ${uploading ? 'bg-primary/5 border-primary/20' : 'bg-[#F8F6FF] border-[#F1ECF8] hover:border-primary/30 hover:bg-white'}
        `}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${uploading ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:scale-110'}`}>
          {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
        </div>

        <div className="text-center">
          <p className="text-[#1C1A23] font-bold">
            {uploading ? 'Uploading to Cloudinary...' : 'Add High-Fashion Images'}
          </p>
          <p className="text-[#605693] text-sm mt-1">Drag and drop or click to browse</p>
        </div>
      </div>

      {/* Previews */}
      {existingUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-[#F0E6FF]">
              <Image 
                src={url} 
                alt={`Preview ${index}`} 
                fill 
                className="object-cover transition-transform group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => onRemove(url)}
                  className="bg-red-500 text-white p-2 rounded-full transform scale-0 group-hover:scale-100 transition-transform"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
