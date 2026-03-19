import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, HardDrive, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  if (!product) return null;

  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors focus-visible:ring-2 focus:outline-none"
              aria-label="Close Quick View"
              title="Close Quick View"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8">
              {primaryImage ? (
                <img
                  src={primaryImage.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
              ) : (
                <div className="text-gray-400 dark:text-gray-600">
                  {product.type === 'software' ? <Monitor className="w-24 h-24" /> : <HardDrive className="w-24 h-24" />}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto overscroll-contain">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  product.type === 'software'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                )}>
                  {product.type}
                </span>
                {product.condition && (
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    product.condition === 'new'
                      ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  )}>
                    {product.condition}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h2>
              <p className="text-xl sm:text-2xl font-bold text-accent-500 mb-4">{formatCurrency(product.price)}</p>

              <div className="flex-1 min-h-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6 line-clamp-4">
                  {product.description || product.short_description}
                </p>

                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="mb-6 space-y-2 hidden sm:block">
                    {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex text-sm">
                        <span className="w-1/3 text-gray-500 capitalize">{key}:</span>
                        <span className="w-2/3 text-gray-900 dark:text-white font-medium truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/products/${product.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                  onClick={onClose}
                >
                  View Full Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
