'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Button } from './ui/button';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
  currentImage?: string;
  label: string;
  cropAspect?: number;
}

export default function ImageUploader({ 
  onImageSelected, 
  currentImage, 
  label, 
  cropAspect = 1 
}: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result?.toString() || '');
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.95);
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (imgRef.current && crop.width && crop.height) {
      try {
        const pixelCrop: PixelCrop = {
          unit: 'px',
          x: crop.x * (imgRef.current.width / 100),
          y: crop.y * (imgRef.current.height / 100),
          width: crop.width * (imgRef.current.width / 100),
          height: crop.height * (imgRef.current.height / 100)
        };
        
        const croppedImageUrl = await getCroppedImg(imgRef.current, pixelCrop);
        onImageSelected(croppedImageUrl);
        setShowCropper(false);
        setSelectedImage(null);
      } catch (e) {
        console.error('Error cropping image:', e);
      }
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      <div className="flex items-center gap-4">
        {currentImage && (
          <div className="flex-shrink-0">
            <img
              src={currentImage}
              alt="Current"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
          </div>
        )}
        
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
            id={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            {currentImage ? 'Change Image' : 'Upload Image'}
          </Button>
        </div>
      </div>

      {showCropper && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
            
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={cropAspect}
                circularCrop={cropAspect === 1}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={selectedImage}
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCropComplete}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Crop & Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}