import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, HardDrive, CheckCircle, XCircle, MessageSquare, X, Mail, MessageCircle, CreditCard, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '../../types';
import { getProduct, getProducts } from '../../api/products';
import { submitInquiry } from '../../api/inquiries';
import { formatCurrency } from '../../utils/formatCurrency';
import { useSettings } from '../../context/SettingsContext';
import ProductCard from '../../components/shared/ProductCard';
import ProductGallery from '../../components/shared/ProductGallery';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';
import { useCart } from '../../context/CartContext';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings, getChannelsForProduct } = useSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cartQty, setCartQty] = useState(1);
  const { addItem } = useCart();

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
      toast.success('Inquiry sent successfully!');
      setTimeout(() => { setShowInquiry(false); setSubmitted(false); setInquiryForm({ name: '', phone: '', email: '', message: '' }); }, 2000);
    } catch {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine which channels are active for this product
  const channels = product ? getChannelsForProduct((product as any).order_channels || null) : null;
  const contactInfo = settings?.contact_info;

  // Build CTA links
  const getMailtoLink = () => {
    if (!product || !contactInfo) return '#';
    const subject = encodeURIComponent(`Inquiry: ${product.name}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in "${product.name}" (${formatCurrency(product.price)}).\n\nPlease share more details or payment information.\n\nThank you.`);
    return `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
  };

  const getWhatsAppLink = () => {
    if (!product || !contactInfo) return '#';
    const text = encodeURIComponent(`Hi! I'm interested in *${product.name}* (${formatCurrency(product.price)}). Can you share more details or payment info?`);
    return `https://wa.me/${contactInfo.whatsapp}?text=${text}`;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: product.name }
        ]}
      />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-4">
        <ProductGallery
          images={product.images}
          type={product.type}
          productName={product.name}
        />

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
          <p className="text-2xl font-bold text-accent-500 mb-4">{formatCurrency(product.price)}</p>

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

          {/* ── Dynamic CTA Bar ─────────────────────── */}
          <div className="flex flex-wrap gap-3 mb-8">
            {channels?.inquiry_form && (
              <button
                onClick={() => setShowInquiry(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/25"
              >
                <MessageSquare className="w-5 h-5" /> Enquire Now
              </button>
            )}

            {channels?.whatsapp && (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/25"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
            )}

            {channels?.email && (
              <a
                href={getMailtoLink()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
              >
                <Mail className="w-5 h-5" /> Email Us
              </a>
            )}

            {channels?.online_payment && (
              <button
                className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/25"
                onClick={() => toast.info('Online payment setup coming soon!')}
              >
                <CreditCard className="w-5 h-5" /> Buy Online
              </button>
            )}
          </div>

          {/* Add to Cart */}
          {product.stock_status === 'in_stock' && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button onClick={() => setCartQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" aria-label="Decrease quantity">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white min-w-[40px] text-center">{cartQty}</span>
                <button onClick={() => setCartQty(q => q + 1)} className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" aria-label="Increase quantity">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];
                  addItem({
                    product_id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price || 0,
                    qty: cartQty,
                    image_url: primaryImage?.image_url || null,
                  });
                  toast.success(`${product.name} added to cart`);
                  setCartQty(1);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          )}

          {/* Payment info note */}
          {(channels?.whatsapp || channels?.email) && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 <strong>How to order:</strong> Contact us via WhatsApp or Email. After confirming your order, share your payment screenshot through chat or email for quick processing.
              </p>
            </div>
          )}

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-4">
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

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
              <button onClick={() => setShowInquiry(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Inquiry Sent!</p>
                <p className="text-sm text-gray-500 mt-2">We'll get back to you soon.</p>
                {(channels?.whatsapp || channels?.email) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <p className="text-xs text-gray-500">You can also reach us directly:</p>
                    <div className="flex justify-center gap-3">
                      {channels?.whatsapp && (
                        <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline font-medium">💬 WhatsApp</a>
                      )}
                      {channels?.email && (
                        <a href={getMailtoLink()} className="text-sm text-blue-600 hover:underline font-medium">📧 Email</a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-4">
                <input type="text" placeholder="Your Name *" required value={inquiryForm.name} onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })} autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="tel" placeholder="Phone Number *" required value={inquiryForm.phone} onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })} autoComplete="tel"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="email" placeholder="Email (optional)" value={inquiryForm.email} onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })} autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                <textarea placeholder="Your Message (optional)" rows={3} value={inquiryForm.message} onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                <button type="submit" disabled={submitting}
                  className="w-full py-2.5 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 disabled:opacity-50 transition-colors">
                  {submitting ? 'Sending…' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
