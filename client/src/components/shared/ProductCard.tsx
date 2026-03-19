import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, HardDrive, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';
import QuickViewModal from './QuickViewModal';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';

export default function ProductCard({ product }: { product: Product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addItem } = useCart();
  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_status !== 'in_stock') return;
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price || 0,
      qty: 1,
      image_url: primaryImage?.image_url || null,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <>
      <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 group shadow-sm hover:-translate-y-1"
      >
        <div className="relative aspect-[4/5] sm:aspect-[4/3] bg-gray-50/50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          {primaryImage ? (
            <img src={primaryImage.image_url} alt={product.name} loading="lazy" width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-gray-400 dark:text-gray-600">
              {product.type === 'software' ? <Monitor className="w-12 h-12" /> : <HardDrive className="w-12 h-12" />}
            </div>
          )}
          
          {/* Overlay Buttons */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
              className="px-3 py-2 bg-white text-gray-900 rounded-full font-medium text-xs sm:text-sm flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-100"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
            {product.stock_status === 'in_stock' && (
              <button
                onClick={handleAddToCart}
                className="px-3 py-2 bg-primary-600 text-white rounded-full font-medium text-xs sm:text-sm flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 hover:bg-primary-700"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </button>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
            <span className={cn(
              'text-[10px] sm:text-xs font-semibold tracking-wide px-2 py-0.5 rounded-full',
              product.type === 'software'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            )}>
              {product.type}
            </span>
            {product.condition && (
              <span className={cn(
                'text-[10px] sm:text-xs font-semibold tracking-wide px-2 py-0.5 rounded-full',
                product.condition === 'new'
                  ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              )}>
                {product.condition}
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 text-sm sm:text-base">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{product.short_description}</p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">{formatCurrency(product.price)}</span>
            <span className={cn(
              'text-[10px] sm:text-xs font-medium uppercase tracking-wider',
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
