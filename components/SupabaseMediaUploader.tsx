'use client';

import React from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';

interface SupabaseMediaUploaderProps {
  onUploadComplete: (urls: string[]) => void;
}

export function SupabaseMediaUploader({ onUploadComplete }: SupabaseMediaUploaderProps) {
  const handleUploadComplete = (files: any) => {
    // files.allEntries contains information about all files in the current session
    const successfulFiles = files.allEntries
      .filter((file: any) => file.status === 'success' || file.status === 'uploaded')
      // Map to the CDN URL. Usually cdnUrl or directUrl.
      .map((file: any) => file.cdnUrl || file.value?.cdnUrl);
    
    if (successfulFiles.length > 0) {
      onUploadComplete(successfulFiles);
    }
  };

  return (
    <div className="w-full">
      <style>{`
        /* Stitch Theme Overrides for Uploadcare */
        .uc-container {
          --uc-primary-color: #5D3FD3;
          --uc-primary-color-hover: #4b32b3;
          --uc-border-radius: 1rem; /* rounded-2xl */
          --uc-font-family: var(--font-inter), sans-serif;
        }

        /* Target specific buttons if variables aren't enough */
        uc-file-uploader-regular uc-btn {
          border-radius: 1rem !important;
          background-color: #5D3FD3 !important;
        }
      `}</style>
      <FileUploaderRegular
        pubkey="bf98222033f79ef23e5f"
        multiple={true}
        imgOnly={true}
        onChange={handleUploadComplete}
        className="uc-light uc-container"
      />
    </div>
  );
}
