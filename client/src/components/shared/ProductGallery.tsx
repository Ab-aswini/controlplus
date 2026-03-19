import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, HardDrive, ZoomIn, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ProductImage } from '../../types';

interface ProductGalleryProps {
  images?: ProductImage[];
  type: 'software' | 'hardware';
  productName: string;
}

export default function ProductGallery({ images = [], type, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden">
        <div className="text-gray-400 dark:text-gray-600">
          {type === 'software' ? <Monitor className="w-24 h-24" /> : <HardDrive className="w-24 h-24" />}
        </div>
      </div>
    );
  }

  // Ensure primary image is first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return 0;
  });

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000) {
      nextSlide();
    } else if (swipe > 10000) {
      prevSlide();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden group cursor-zoom-in"
        onClick={() => setIsLightboxOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={sortedImages[currentIndex].image_url}
            alt={`${productName} - Image ${currentIndex + 1}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <ZoomIn className="w-10 h-10 text-white drop-shadow-md" />
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {sortedImages.map((image, idx) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                currentIndex === idx 
                  ? "border-primary-500 shadow-md" 
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100"
              )}
              aria-label={`View thumbnail ${idx + 1}`}
              title={`View thumbnail ${idx + 1}`}
            >
              <img 
                src={image.image_url} 
                alt={`${productName} thumbnail ${idx + 1}`}
                width={150}
                height={150}
                className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors"
            aria-label="Close Lightbox"
            title="Close Lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <img 
            src={sortedImages[currentIndex].image_url} 
            alt={`${productName} view ${currentIndex + 1}`}
            width={800}
            height={800}
            className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
            onClick={e => {
              e.stopPropagation();
              // Lightbox zoom logic could go here if implemented
            }}
            onDragStart={e => e.preventDefault()}
          />
        </div>
      )}
    </div>
  );
}
