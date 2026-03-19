import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../api/cart';
import { formatCurrency } from '../../utils/formatCurrency';
import { toast } from 'sonner';

export default function CartSidebar() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalAmount, isOpen, closeCart } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || undefined,
        customer_address: form.address || undefined,
        notes: form.notes || undefined,
        items,
      });
      setOrderId(order.id?.slice(0, 8) || '');
      clearCart();
      setStep('success');
      toast.success('Order placed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeCart();
    // Reset to cart step after close animation
    setTimeout(() => { setStep('cart'); setForm({ name: '', phone: '', email: '', address: '', notes: '' }); }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          />
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[201] w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
                {step === 'cart' ? `Cart (${totalItems})` : step === 'checkout' ? 'Checkout' : 'Order Placed!'}
              </h2>
              <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {step === 'cart' && (
                <>
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add products to get started</p>
                      <button onClick={handleClose} className="mt-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {items.map(item => (
                        <div key={item.product_id} className="px-5 py-4 flex gap-3">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-sm text-primary-600 font-semibold mt-0.5">{formatCurrency(item.price)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQty(item.product_id, item.qty - 1)}
                                disabled={item.qty <= 1}
                                className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium text-gray-900 dark:text-white w-6 text-center">{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.product_id, item.qty + 1)}
                                className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {/* Line total + remove */}
                          <div className="flex flex-col items-end justify-between">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.price * item.qty)}</p>
                            <button onClick={() => removeItem(item.product_id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors" aria-label={`Remove ${item.name} from cart`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 'checkout' && (
                <form id="checkout-form" onSubmit={handleCheckout} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Full Name *</label>
                    <input type="text" required placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Phone Number *</label>
                    <input type="tel" required placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Email (optional)</label>
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Address (optional)</label>
                    <textarea rows={2} placeholder="Delivery address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Notes (optional)</label>
                    <textarea rows={2} placeholder="Any special instructions" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none" />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Order Summary</h4>
                    {items.map(item => (
                      <div key={item.product_id} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300 truncate mr-2">{item.name} × {item.qty}</span>
                        <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </form>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Placed!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                    Your order has been received. Our team will contact you shortly to confirm the details.
                  </p>
                  {orderId && (
                    <p className="text-xs text-gray-400 mt-3">Order ID: <span className="font-mono font-medium text-gray-600 dark:text-gray-300">{orderId}</span></p>
                  )}
                  <button onClick={handleClose} className="mt-6 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {step === 'cart' && items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-gray-900 dark:text-white text-base">{formatCurrency(totalAmount)}</span>
                </div>
                <button onClick={() => setStep('checkout')}
                  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {step === 'checkout' && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-2">
                <button type="submit" form="checkout-form" disabled={submitting}
                  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary-600/20">
                  {submitting ? 'Placing Order…' : `Place Order — ${formatCurrency(totalAmount)}`}
                </button>
                <button onClick={() => setStep('cart')} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
