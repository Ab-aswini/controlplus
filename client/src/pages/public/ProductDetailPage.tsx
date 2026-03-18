import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, HardDrive, CheckCircle, XCircle, MessageSquare, X } from 'lucide-react';
import { Product } from '../../types';
import { getProduct, getProducts } from '../../api/products';
import { submitInquiry } from '../../api/inquiries';
import { formatCurrency } from '../../utils/formatCurrency';
import ProductCard from '../../components/shared/ProductCard';
import { cn } from '../../utils/cn';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProduct(slug)
      .then(p => {
        setProduct(p);
        getProducts({ category: p.category })
          .then(all => setRelated(all.filter(r => r.id !== p.id).slice(0, 3)))
          .catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    try {
      await submitInquiry({
        ...inquiryForm,
        product_id: product.id,
        source: 'product_page',
      });
      setSubmitted(true);
      setTimeout(() => { setShowInquiry(false); setSubmitted(false); setInquiryForm({ name: '', phone: '', email: '', message: '' }); }, 2000);
    } catch {
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h2>
        <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">Back to Products</Link>
      </div>
    );
  }

  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden">
          {primaryImage ? (
            <img src={primaryImage.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 dark:text-gray-600">
              {product.type === 'software' ? <Monitor className="w-24 h-24" /> : <HardDrive className="w-24 h-24" />}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              product.type === 'software' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            )}>
              {product.type}
            </span>
            {product.condition && (
              <span className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full',
                product.condition === 'new' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              )}>
                {product.condition}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-primary-600 mb-4">{formatCurrency(product.price)}</p>

          <div className="flex items-center gap-2 mb-4">
            {product.stock_status === 'in_stock' ? (
              <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> In Stock</span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-red-500"><XCircle className="w-4 h-4" /> Out of Stock</span>
            )}
          </div>

          {product.warranty_info && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Warranty: {product.warranty_info}</p>
          )}

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{product.description}</p>

          <button
            onClick={() => setShowInquiry(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <MessageSquare className="w-5 h-5" /> Enquire Now
          </button>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Specifications</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <div key={key} className={cn('flex', i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-950')}>
                    <div className="w-1/3 px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{key}</div>
                    <div className="w-2/3 px-4 py-2.5 text-sm text-gray-900 dark:text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowInquiry(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enquire About {product.name}</h3>
              <button onClick={() => setShowInquiry(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Inquiry Sent!</p>
                <p className="text-sm text-gray-500">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name *"
                  required
                  value={inquiryForm.name}
                  onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={inquiryForm.phone}
                  onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={inquiryForm.email}
                  onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  placeholder="Your Message (optional)"
                  rows={3}
                  value={inquiryForm.message}
                  onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
