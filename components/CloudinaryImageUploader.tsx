'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface CloudinaryImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export default function CloudinaryImageUploader({ onUploadSuccess }: CloudinaryImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dkmmguzkf/image/upload';
  const UPLOAD_PRESET = 'bookingsplace_preset';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onUploadSuccess(data.secure_url);
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-[20px] p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-3
        ${uploading ? 'bg-purple-50 border-purple-200' : 'bg-[#F8F6FF] border-[#F1ECF8] hover:border-[#5D3FD3]/30'}
      `}
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${uploading ? 'bg-[#5D3FD3] text-white' : 'bg-[#5D3FD3]/10 text-[#5D3FD3]'}`}>
        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-[#1C1A23]">
          {uploading ? 'Uploading...' : 'Add Service Image'}
        </p>
      </div>
    </div>
  );
}
