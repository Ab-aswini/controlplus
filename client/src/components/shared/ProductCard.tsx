import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, HardDrive, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';
import QuickViewModal from './QuickViewModal';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];

  return (
    <>
      <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow group"
      >
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          {primaryImage ? (
            <img src={primaryImage.image_url} alt={product.name} loading="lazy" width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-gray-400 dark:text-gray-600">
              {product.type === 'software' ? <Monitor className="w-12 h-12" /> : <HardDrive className="w-12 h-12" />}
            </div>
          )}
          
          {/* Quick View Button Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              className="px-4 py-2 bg-white text-gray-900 rounded-full font-medium text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-100"
            >
              <Eye className="w-4 h-4" /> Quick View
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
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

          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{product.short_description}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-accent-500">{formatCurrency(product.price)}</span>
            <span className={cn(
              'text-xs font-medium',
              product.stock_status === 'in_stock' ? 'text-green-600' : 'text-red-500'
            )}>
              {product.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {product.warranty_info && (
            <p className="text-xs text-gray-400 mt-2">{product.warranty_info}</p>
          )}
        </div>
      </Link>
      </motion.div>

      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}
