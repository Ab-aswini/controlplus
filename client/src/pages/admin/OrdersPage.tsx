import { useEffect, useState } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronUp, FileText, Search, Package } from 'lucide-react';
import { Order, OrderItem, Product } from '../../types';
import { getOrders, createOrder, updateOrderStatus, deleteOrder, getOrderItems } from '../../api/orders';
import { getInvoiceByOrderId, getNextInvoiceNumber, createInvoice } from '../../api/invoices';
import { getProducts } from '../../api/products';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;
const STATUS_TABS = [{ value: '', label: 'All' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))];

interface FormItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Expanded order details
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Form state
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', customer_address: '', notes: '' });
  const [formItems, setFormItems] = useState<FormItem[]>([{ product_id: null, product_name: '', quantity: 1, unit_price: 0 }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Invoice states
  const [orderInvoices, setOrderInvoices] = useState<Record<string, string>>({});
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);

  useEffect(() => { getProducts().then(setProducts).catch(() => {}); }, []);

  const load = (status?: string) => {
    setLoading(true);
    getOrders(status).then(async (data) => {
      setOrders(data);
      // Load invoice numbers for confirmed/delivered orders
      const invoiceMap: Record<string, string> = {};
      for (const order of data) {
        if (order.invoice_id) {
          // We'll load invoice details when expanding
        }
        if (order.status === 'confirmed' || order.status === 'delivered') {
          try {
            const inv = await getInvoiceByOrderId(order.id);
            if (inv) invoiceMap[order.id] = inv.invoice_number;
          } catch {}
        }
      }
      setOrderInvoices(invoiceMap);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(filter || undefined); }, [filter]);

  const toggleExpand = async (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    setLoadingItems(true);
    try {
      const items = await getOrderItems(orderId);
      setExpandedItems(items);
    } catch { setExpandedItems([]); }
    finally { setLoadingItems(false); }
  };

  const handleStatus = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success('Status updated');

      // Auto-generate invoice on confirm
      if (newStatus === 'confirmed' && !orderInvoices[id]) {
        await autoGenerateInvoiceForOrder(id);
      }

      load(filter || undefined);
    } catch { toast.error('Failed to update'); }
  };

  const autoGenerateInvoiceForOrder = async (orderId: string) => {
    setGeneratingInvoice(orderId);
    try {
      // Check if invoice already exists
      const existing = await getInvoiceByOrderId(orderId);
      if (existing) {
        setOrderInvoices(prev => ({ ...prev, [orderId]: existing.invoice_number }));
        return;
      }

      // Get order details
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Get order items
      const items = await getOrderItems(orderId);

      // Generate invoice number
      const prefix = settings?.invoice_settings?.prefix || 'INV';
      const invoiceNumber = await getNextInvoiceNumber(prefix);

      // Calculate totals
      const taxRate = settings?.invoice_settings?.tax_rate || 0;
      const subtotal = items.length > 0
        ? items.reduce((sum, i) => sum + i.total, 0)
        : order.total_amount || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      // Create invoice
      const invoiceItems = items.length > 0
        ? items.map(i => ({ name: i.product_name, qty: i.quantity, price: i.unit_price, total: i.total }))
        : [{ name: order.product_name || 'Order Item', qty: order.quantity || 1, price: subtotal, total: subtotal }];

      const invoice = await createInvoice({
        invoice_number: invoiceNumber,
        order_id: orderId,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email || null,
        customer_address: order.customer_address || null,
        items: invoiceItems,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount: 0,
        total,
        payment_status: 'unpaid',
        payment_method: null,
        notes: order.notes,
        created_by: null,
      });

      // Link invoice to order
      const { supabase } = await import('../../lib/supabase');
      await supabase.from('orders').update({ invoice_id: invoice.id }).eq('id', orderId);

      setOrderInvoices(prev => ({ ...prev, [orderId]: invoiceNumber }));
      toast.success(`Invoice ${invoiceNumber} auto-generated ✅`);
    } catch (err) {
      console.error('Auto-invoice error:', err);
      toast.error('Failed to generate invoice');
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = formItems.filter(i => i.product_name.trim());
    if (validItems.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    setSaving(true);
    try {
      await createOrder(
        {
          customer_name: form.customer_name,
          customer_phone: form.customer_phone || null,
          customer_email: form.customer_email || null,
          customer_address: form.customer_address || null,
          notes: form.notes || null,
        },
        validItems.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
        }))
      );
      setShowForm(false);
      resetForm();
      toast.success('Order created');
      load(filter || undefined);
    } catch { toast.error('Failed to create order'); }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    setForm({ customer_name: '', customer_phone: '', customer_email: '', customer_address: '', notes: '' });
    setFormItems([{ product_id: null, product_name: '', quantity: 1, unit_price: 0 }]);
    setProductSearch('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    try { await deleteOrder(id); toast.success('Order deleted'); load(filter || undefined); } catch { toast.error('Failed to delete'); }
  };

  const addFormItem = () => {
    setFormItems(prev => [...prev, { product_id: null, product_name: '', quantity: 1, unit_price: 0 }]);
  };

  const removeFormItem = (idx: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateFormItem = (idx: number, field: keyof FormItem, value: string | number | null) => {
    setFormItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const selectProduct = (idx: number, product: Product) => {
    setFormItems(prev => prev.map((item, i) => i === idx ? {
      ...item,
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price || 0,
    } : item));
    setProductSearch('');
  };

  const formTotal = formItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', filter === tab.value ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Order
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 w-8"></th>
                <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Invoice</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(9)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" /></td>)}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
              ) : orders.map(order => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <td className="px-4 py-3 text-gray-400">
                      {expandedId === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{order.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500">{order.customer_phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                        <Package className="w-3.5 h-3.5" />
                        {order.item_count || 1} {(order.item_count || 1) === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatus(order.id, e.target.value)}
                        aria-label={`Update status for order by ${order.customer_name}`}
                        title="Update Order Status"
                        className={cn('text-xs font-medium px-2 py-1 rounded-lg border-0 outline-none cursor-pointer',
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : order.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        )}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {orderInvoices[order.id] ? (
                        <button
                          onClick={() => navigate('/admin/invoices')}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 rounded-lg hover:bg-teal-200 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          {orderInvoices[order.id]}
                        </button>
                      ) : generatingInvoice === order.id ? (
                        <span className="text-xs text-gray-400">Generating…</span>
                      ) : order.status === 'confirmed' || order.status === 'delivered' ? (
                        <button
                          onClick={() => autoGenerateInvoiceForOrder(order.id)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Generate
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleDelete(order.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label={`Delete order by ${order.customer_name}`} title="Delete Order">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Row — Order Items */}
                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={9} className="bg-gray-50/50 dark:bg-gray-800/30 px-8 py-4">
                        {loadingItems ? (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-4 h-4 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin" /> Loading items…
                          </div>
                        ) : expandedItems.length === 0 ? (
                          <div className="text-sm text-gray-400">
                            {order.product_name ? (
                              <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-600 dark:text-gray-300">{order.product_name}</span>
                                <span>×{order.quantity}</span>
                                <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                              </div>
                            ) : 'No items found'}
                          </div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-gray-500 uppercase">
                                <th className="pb-2 font-medium">Product</th>
                                <th className="pb-2 font-medium text-center">Qty</th>
                                <th className="pb-2 font-medium text-right">Price</th>
                                <th className="pb-2 font-medium text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {expandedItems.map(item => (
                                <tr key={item.id}>
                                  <td className="py-2 text-gray-800 dark:text-gray-200">{item.product_name}</td>
                                  <td className="py-2 text-center text-gray-500">{item.quantity}</td>
                                  <td className="py-2 text-right text-gray-500">{formatCurrency(item.unit_price)}</td>
                                  <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {order.notes && (
                          <p className="mt-3 text-xs text-gray-400"><strong>Notes:</strong> {order.notes}</p>
                        )}
                        {(order.customer_email || order.customer_address) && (
                          <div className="mt-2 flex gap-4 text-xs text-gray-400">
                            {order.customer_email && <span>✉ {order.customer_email}</span>}
                            {order.customer_address && <span>📍 {order.customer_address}</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => { setShowForm(false); resetForm(); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Order</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600" aria-label="Close form"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Customer Name *" required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                  className="col-span-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                <input type="tel" placeholder="Phone" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                <input type="email" placeholder="Email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Products</h4>
                  <button type="button" onClick={addFormItem} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search product or type custom…"
                              value={item.product_name}
                              onChange={e => {
                                updateFormItem(idx, 'product_name', e.target.value);
                                updateFormItem(idx, 'product_id', null);
                                setProductSearch(e.target.value);
                              }}
                              onFocus={() => setProductSearch(item.product_name)}
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                          </div>
                          {formItems.length > 1 && (
                            <button type="button" onClick={() => removeFormItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500" aria-label="Remove item">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {/* Product dropdown */}
                        {productSearch && document.activeElement?.closest('.relative') === document.activeElement?.parentElement && filteredProducts.length > 0 && !item.product_id && (
                          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredProducts.slice(0, 8).map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => selectProduct(idx, p)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between"
                              >
                                <span className="truncate">{p.name}</span>
                                <span className="text-gray-400 ml-2 flex-shrink-0">{formatCurrency(p.price)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase">Qty</label>
                          <input type="number" min="1" value={item.quantity}
                            onChange={e => updateFormItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase">Unit Price</label>
                          <input type="number" min="0" step="0.01" value={item.unit_price}
                            onChange={e => updateFormItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase">Line Total</label>
                          <div className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(formTotal)}</span>
                </div>
              </div>

              <textarea placeholder="Notes (optional)" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm" />

              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Creating…' : 'Create Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
