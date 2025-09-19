'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Button } from './ui/button';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/image-crop.css';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
  currentImage?: string;
  label: string;
  cropAspect?: number;
  enableCrop?: boolean;
}

export default function ImageUploader({
  onImageSelected,
  currentImage,
  label,
  cropAspect = 1,
  enableCrop = true
}: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const imageDataUrl = reader.result?.toString() || '';
        if (enableCrop) {
          setSelectedImage(imageDataUrl);
          setShowCropper(true);
        } else {
          // If cropping is disabled, directly use the image
          onImageSelected(imageDataUrl);
        }
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop, circular: boolean = false): Promise<string> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // For circular crops, ensure the canvas is square
      if (circular) {
        const size = Math.min(crop.width, crop.height);
        canvas.width = size;
        canvas.height = size;
      } else {
        canvas.width = crop.width;
        canvas.height = crop.height;
      }

      // Fill with transparent background
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // If circular crop, create a circular clipping path
      if (circular) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
          0,
          2 * Math.PI
        );
        ctx.closePath();
        ctx.clip();
      }

      // Calculate source crop dimensions
      const sourceX = crop.x * scaleX;
      const sourceY = crop.y * scaleY;
      const sourceWidth = crop.width * scaleX;
      const sourceHeight = crop.height * scaleY;

      if (circular) {
        // For circular crops, ensure we draw a perfect square
        const size = Math.min(crop.width, crop.height);

        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          size * scaleX,
          size * scaleY,
          0,
          0,
          size,
          size
        );
      } else {
        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          crop.width,
          crop.height
        );
      }

      if (circular) {
        ctx.restore();
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }, 'image/png', 0.95); // Use PNG to preserve transparency
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      try {
        const isCircular = cropAspect === 1;
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop, isCircular);
        onImageSelected(croppedImageUrl);
        setShowCropper(false);
        setSelectedImage(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
      } catch (e) {
        console.error('Error cropping image:', e);
      }
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
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

            <div className="mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={cropAspect}
                circularCrop={cropAspect === 1}
                keepSelection
                minWidth={50}
                minHeight={50}
                className="react-crop-circular"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={selectedImage}
                  style={{ maxHeight: '400px', maxWidth: '100%', display: 'block' }}
                  onLoad={() => {
                    // Set initial crop when image loads
                    if (!crop && imgRef.current) {
                      const { width, height } = imgRef.current;

                      let newCrop;
                      if (cropAspect === 1) {
                        // For square/circular crops
                        const cropSize = Math.min(width, height) * 0.8;
                        newCrop = {
                          unit: 'px' as const,
                          width: cropSize,
                          height: cropSize,
                          x: (width - cropSize) / 2,
                          y: (height - cropSize) / 2
                        };
                      } else {
                        // For other aspect ratios
                        const maxSize = Math.min(width, height) * 0.8;
                        const cropWidth = maxSize;
                        const cropHeight = maxSize / cropAspect;

                        newCrop = {
                          unit: 'px' as const,
                          width: cropWidth,
                          height: cropHeight,
                          x: (width - cropWidth) / 2,
                          y: (height - cropHeight) / 2
                        };
                      }

                      setCrop(newCrop);
                      setCompletedCrop(newCrop);
                    }
                  }}
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