"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (croppedImage: Blob, aspectRatio: 'landscape' | 'square') => void;
  onCancel: () => void;
}

// GMB optimal dimensions
const CROP_PRESETS = {
  landscape: { width: 1200, height: 900, aspect: 4 / 3, label: '4:3' },
  square: { width: 1080, height: 1080, aspect: 1, label: '1:1' },
};

type GridType = 'none' | '2x2' | '3x3' | '4x4' | 'phi';

export default function PhotoEditor({ imageUrl, onSave, onCancel }: PhotoEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'square'>('landscape');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'aspect'>('grid');
  const [gridType, setGridType] = useState<GridType>('3x3');

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      if (croppedImage) {
        onSave(croppedImage, aspectRatio);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black">
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          <Check className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative bg-black">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={CROP_PRESETS[aspectRatio].aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          showGrid={gridType !== 'none'}
          objectFit="contain"
          cropShape="rect"
          style={{
            containerStyle: {
              backgroundColor: '#000',
            },
            cropAreaStyle: {
              border: '2px solid rgba(255, 255, 255, 0.5)',
            },
          }}
        />
      </div>

      {/* Bottom Controls */}
      <div className="bg-black border-t border-white/10 px-6 py-4">
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-6 py-2 text-sm font-medium transition-colors rounded-lg ${
              activeTab === 'grid'
                ? 'bg-yellow-500 text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            GRID
          </button>
          <button
            onClick={() => setActiveTab('aspect')}
            className={`px-6 py-2 text-sm font-medium transition-colors rounded-lg ${
              activeTab === 'aspect'
                ? 'bg-yellow-500 text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            ASPECT RATIO
          </button>
        </div>

        {/* Grid Options */}
        {activeTab === 'grid' && (
          <div className="flex justify-center gap-6">
            {/* None */}
            <button
              onClick={() => setGridType('none')}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded border-2 transition-colors ${
                  gridType === 'none'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              />
              <span className={`text-xs ${gridType === 'none' ? 'text-yellow-500' : 'text-white/50'}`}>
                None
              </span>
            </button>

            {/* 4x4 Grid */}
            <button
              onClick={() => setGridType('4x4')}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded border-2 grid grid-cols-4 grid-rows-4 p-0.5 transition-colors ${
                  gridType === '4x4'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-current opacity-30" />
                ))}
              </div>
              <span className={`text-xs ${gridType === '4x4' ? 'text-yellow-500' : 'text-white/50'}`}>
                4x4
              </span>
            </button>

            {/* 3x3 Grid */}
            <button
              onClick={() => setGridType('3x3')}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded border-2 grid grid-cols-3 grid-rows-3 p-0.5 transition-colors ${
                  gridType === '3x3'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-current opacity-30" />
                ))}
              </div>
              <span className={`text-xs ${gridType === '3x3' ? 'text-yellow-500' : 'text-white/50'}`}>
                3x3
              </span>
            </button>

            {/* 2x2 Grid */}
            <button
              onClick={() => setGridType('2x2')}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded border-2 grid grid-cols-2 grid-rows-2 p-0.5 transition-colors ${
                  gridType === '2x2'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border border-current opacity-30" />
                ))}
              </div>
              <span className={`text-xs ${gridType === '2x2' ? 'text-yellow-500' : 'text-white/50'}`}>
                2x2
              </span>
            </button>

            {/* Phi Grid */}
            <button
              onClick={() => setGridType('phi')}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded border-2 grid grid-cols-5 grid-rows-5 p-0.5 transition-colors ${
                  gridType === 'phi'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="border border-current opacity-30" />
                ))}
              </div>
              <span className={`text-xs ${gridType === 'phi' ? 'text-yellow-500' : 'text-white/50'}`}>
                Phi
              </span>
            </button>
          </div>
        )}

        {/* Aspect Ratio Options */}
        {activeTab === 'aspect' && (
          <div className="flex justify-center gap-6">
            {/* Landscape 4:3 */}
            <button
              onClick={() => setAspectRatio('landscape')}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-16 h-12 rounded border-2 flex items-center justify-center transition-colors ${
                  aspectRatio === 'landscape'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                <div className="w-10 h-6 border border-current rounded opacity-50" />
              </div>
              <span className={`text-xs ${aspectRatio === 'landscape' ? 'text-yellow-500' : 'text-white/50'}`}>
                4:3
              </span>
            </button>

            {/* Square 1:1 */}
            <button
              onClick={() => setAspectRatio('square')}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-16 h-12 rounded border-2 flex items-center justify-center transition-colors ${
                  aspectRatio === 'square'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                <div className="w-8 h-8 border border-current rounded opacity-50" />
              </div>
              <span className={`text-xs ${aspectRatio === 'square' ? 'text-yellow-500' : 'text-white/50'}`}>
                1:1
              </span>
            </button>
          </div>
        )}

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            Optimized for Google My Business • Pinch to zoom • Drag to reposition
          </p>
        </div>
      </div>
    </div>
  );
}
