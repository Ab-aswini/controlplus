import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import { getProducts } from '../../api/products';
import ProductCard from '../../components/shared/ProductCard';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/cn';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'billing', label: 'Billing' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'pos', label: 'POS' },
  { value: 'crm', label: 'CRM' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'laptop', label: 'Laptops' },
  { value: 'printer', label: 'Printers' },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const activeType = searchParams.get('type') || '';
  const activeCategory = searchParams.get('category') || '';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update URL params when debounced search changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('search', debouncedSearch);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeType) params.type = activeType;
    if (activeCategory) params.category = activeCategory;
    if (debouncedSearch) params.search = debouncedSearch;

    getProducts(params)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeType, activeCategory, debouncedSearch]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-primary-200">Browse our complete range of software and hardware solutions</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            
            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchQuery && products.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="max-h-60 overflow-y-auto">
                    {products.slice(0, 5).map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setSearchQuery(p.name);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            {[
              { value: '', label: 'All' },
              { value: 'software', label: 'Software' },
              { value: 'hardware', label: 'Hardware' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateFilter('type', opt.value)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-colors',
                  activeType === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={activeCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            aria-label="Filter by category"
            title="Category Filter"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="No products found"
            description="Try adjusting your filters or search query to find what you're looking for."
            className="my-12"
          />
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {products.map(product => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
