import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Order } from '../../types';
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from '../../api/orders';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;
const STATUS_TABS = [{ value: '', label: 'All' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', product_name: '', quantity: '1', total_amount: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = (status?: string) => {
    setLoading(true);
    getOrders(status).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(filter || undefined); }, [filter]);

  const handleStatus = async (id: number, status: string) => {
    try { await updateOrderStatus(id, status); load(filter || undefined); } catch { alert('Failed to update'); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrder({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || null,
        product_name: form.product_name || null,
        quantity: parseInt(form.quantity) || 1,
        total_amount: form.total_amount ? parseFloat(form.total_amount) : null,
        notes: form.notes || null,
      });
      setShowForm(false);
      setForm({ customer_name: '', customer_phone: '', product_name: '', quantity: '1', total_amount: '', notes: '' });
      load(filter || undefined);
    } catch { alert('Failed to create order'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this order?')) return;
    try { await deleteOrder(id); load(filter || undefined); } catch { alert('Failed to delete'); }
  };

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
                <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 font-medium text-gray-500">Qty</th>
                <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" /></td>)}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{order.customer_name}</td>
                  <td className="px-4 py-3 text-gray-500">{order.customer_phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{order.product_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{order.quantity}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <select value={order.status} onChange={e => handleStatus(order.id, e.target.value)}
                      className={cn('text-xs font-medium px-2 py-1 rounded-lg border-0 outline-none cursor-pointer',
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : order.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      )}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(order.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Order</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Customer Name *" required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="tel" placeholder="Phone" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" placeholder="Product Name" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="number" placeholder="Total Amount" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
