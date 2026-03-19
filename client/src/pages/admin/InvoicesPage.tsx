import { useState, useEffect, useRef } from 'react';
import { Plus, Printer, Trash2, Receipt, Loader2, X, Eye } from 'lucide-react';
import { Invoice, InvoiceItem, getInvoices, createInvoice, deleteInvoice, generateInvoiceNumber } from '../../api/invoices';
import { getProducts } from '../../api/products';
import { Product } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  unpaid: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

// ── Print-Ready Invoice View ─────────────────────────────
function InvoicePrintView({ invoice, company, onClose }: { invoice: Invoice; company: { name: string; gstin: string; address: string; phone: string; email: string }; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb; }
        .company-name { font-size: 24px; font-weight: 700; color: #0f766e; }
        .invoice-title { font-size: 28px; font-weight: 700; text-align: right; }
        .invoice-num { font-size: 14px; color: #6b7280; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .meta-section h4 { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; font-weight: 600; }
        .meta-section p { font-size: 14px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: #f3f4f6; padding: 10px 16px; text-align: left; font-size: 12px; text-transform: uppercase; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
        tbody td { padding: 10px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 280px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total-row.grand { font-size: 18px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 12px; margin-top: 8px; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
        .notes { margin-top: 24px; padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; color: #6b7280; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-unpaid { background: #fee2e2; color: #991b1b; }
        .status-partial { background: #fef3c7; color: #92400e; }
      </style></head><body>
      ${content.innerHTML}
      <div class="footer">Thank you for your business!</div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h3 className="text-lg font-bold text-gray-900">Invoice Preview</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div ref={printRef} className="text-gray-900">
          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid #e5e7eb' }}>
            <div>
              <div className="company-name" style={{ fontSize: 24, fontWeight: 700, color: '#0f766e' }}>{company.name}</div>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{company.address}</p>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{company.phone} • {company.email}</p>
              {company.gstin && <p style={{ fontSize: 13, color: '#6b7280' }}>GSTIN: {company.gstin}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>INVOICE</div>
              <p style={{ fontSize: 14, color: '#6b7280' }}>{invoice.invoice_number}</p>
              <p style={{ fontSize: 14, color: '#6b7280' }}>{formatDate(invoice.created_at)}</p>
              <span className={`status status-${invoice.payment_status}`} style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                background: invoice.payment_status === 'paid' ? '#dcfce7' : invoice.payment_status === 'partial' ? '#fef3c7' : '#fee2e2',
                color: invoice.payment_status === 'paid' ? '#166534' : invoice.payment_status === 'partial' ? '#92400e' : '#991b1b',
              }}>
                {invoice.payment_status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Bill To</h4>
              <p style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 600 }}>{invoice.customer_name}</p>
              {invoice.customer_phone && <p style={{ fontSize: 14, color: '#6b7280' }}>{invoice.customer_phone}</p>}
              {invoice.customer_email && <p style={{ fontSize: 14, color: '#6b7280' }}>{invoice.customer_email}</p>}
              {invoice.customer_address && <p style={{ fontSize: 14, color: '#6b7280' }}>{invoice.customer_address}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Payment Method</h4>
              <p style={{ fontSize: 14 }}>{invoice.payment_method || 'N/A'}</p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr>
                <th style={{ background: '#f3f4f6', padding: '10px 16px', textAlign: 'left', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>#</th>
                <th style={{ background: '#f3f4f6', padding: '10px 16px', textAlign: 'left', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Item</th>
                <th style={{ background: '#f3f4f6', padding: '10px 16px', textAlign: 'right', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Qty</th>
                <th style={{ background: '#f3f4f6', padding: '10px 16px', textAlign: 'right', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Rate</th>
                <th style={{ background: '#f3f4f6', padding: '10px 16px', textAlign: 'right', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>{i + 1}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                    <strong>{item.name}</strong>
                    {item.description && <p style={{ fontSize: 12, color: '#6b7280' }}>{item.description}</p>}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14, textAlign: 'right' }}>{item.qty}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14, textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14, textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginLeft: 'auto', width: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
              <span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: '#16a34a' }}>
                <span>Discount</span><span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
              <span>Tax ({invoice.tax_rate}%)</span><span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 6px', fontSize: 18, fontWeight: 700, borderTop: '2px solid #1a1a1a', marginTop: 8 }}>
              <span>Total</span><span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div style={{ marginTop: 24, padding: 12, background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#6b7280' }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Invoices Page ───────────────────────────────────
export default function InvoicesPage() {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Form state
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '', customer_address: '',
    payment_status: 'unpaid' as 'unpaid' | 'partial' | 'paid',
    payment_method: '', notes: '', discount: 0,
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ name: '', description: '', qty: 1, price: 0, total: 0 }]);

  const fetchInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    getProducts().then(setProducts).catch(() => {});
  }, []);

  const selectProduct = (index: number, productId: string) => {
    if (productId === '__custom__') {
      updateItem(index, 'name', '');
      return;
    }
    const p = products.find(pr => pr.id === productId);
    if (p) {
      const updated = [...items];
      updated[index] = { ...updated[index], name: p.name, price: p.price || 0, total: (p.price || 0) * updated[index].qty };
      setItems(updated);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    updated[index].total = updated[index].qty * updated[index].price;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { name: '', description: '', qty: 1, price: 0, total: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = settings?.invoice_settings?.tax_rate || 18;
  const taxAmount = (subtotal - form.discount) * taxRate / 100;
  const total = subtotal - form.discount + taxAmount;

  const handleCreate = async () => {
    if (!form.customer_name || items.length === 0 || !items[0].name) {
      toast.error('Please fill customer name and at least one item');
      return;
    }
    setSaving(true);
    try {
      const prefix = settings?.invoice_settings?.prefix || 'INV';
      const nextNum = settings?.invoice_settings?.next_number || invoices.length + 1;
      const invoiceNumber = await generateInvoiceNumber(prefix, nextNum);

      const { data: { user } } = await (await import('../../lib/supabase')).supabase.auth.getUser();

      await createInvoice({
        invoice_number: invoiceNumber,
        order_id: null,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone || null,
        customer_email: form.customer_email || null,
        customer_address: form.customer_address || null,
        items,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount: form.discount,
        total,
        payment_status: form.payment_status,
        payment_method: form.payment_method || null,
        notes: form.notes || null,
        created_by: user?.id || null,
      });

      // Increment next invoice number
      if (settings?.invoice_settings) {
        const { updateSetting } = await import('../../api/settings');
        await updateSetting('invoice_settings', {
          ...settings.invoice_settings,
          next_number: nextNum + 1,
        });
      }

      toast.success('Invoice created!');
      setShowCreate(false);
      setForm({ customer_name: '', customer_phone: '', customer_email: '', customer_address: '', payment_status: 'unpaid', payment_method: '', notes: '', discount: 0 });
      setItems([{ name: '', description: '', qty: 1, price: 0, total: 0 }]);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch { toast.error('Failed to delete'); }
  };

  const company = {
    name: settings?.invoice_settings?.company_name || 'ControlPlus',
    gstin: settings?.invoice_settings?.gstin || '',
    address: settings?.contact_info?.address || '',
    phone: settings?.contact_info?.phone || '',
    email: settings?.contact_info?.email || '',
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoices</h2>
          <p className="text-sm text-gray-500">{invoices.length} invoices total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" /></div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No invoices yet</h3>
          <p className="text-gray-500">Create your first invoice to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{inv.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', STATUS_COLORS[inv.payment_status])}>
                      {inv.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inv.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewInvoice(inv)} className="p-1.5 text-gray-500 hover:text-primary-600" title="View & Print"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-gray-500 hover:text-red-600 ml-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Invoice</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>

            {/* Customer Info */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Customer Details</h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <input className={inputClass} placeholder="Customer Name *" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
              <input className={inputClass} placeholder="Phone" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} />
              <input className={inputClass} placeholder="Email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} />
              <input className={inputClass} placeholder="Address" value={form.customer_address} onChange={e => setForm({ ...form, customer_address: e.target.value })} />
            </div>

            {/* Items */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items</h4>
            <div className="space-y-2 mb-4">
              {items.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <select
                      className={cn(inputClass, 'flex-1')}
                      value={products.find(p => p.name === item.name)?.id || '__custom__'}
                      onChange={e => selectProduct(i, e.target.value)}
                    >
                      <option value="__custom__">— Custom Item —</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price || 0)})</option>
                      ))}
                    </select>
                    <input type="number" className={cn(inputClass, 'w-20')} placeholder="Qty" min={1} value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} />
                    <input type="number" className={cn(inputClass, 'w-28')} placeholder="Rate" min={0} value={item.price || ''} onChange={e => updateItem(i, 'price', Number(e.target.value))} />
                    <span className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[80px] text-right py-2">{formatCurrency(item.total)}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="p-2 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  {(!products.find(p => p.name === item.name)) && (
                    <input className={cn(inputClass, 'text-xs')} placeholder="Custom item name *" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                  )}
                </div>
              ))}
              <button onClick={addItem} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add Item</button>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-6">
              <div className="flex justify-end gap-8 text-sm">
                <div className="space-y-2 text-right">
                  <p className="text-gray-500">Subtotal: <strong className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</strong></p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-gray-500">Discount:</span>
                    <input type="number" className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-right text-sm text-gray-900 dark:text-white" value={form.discount || ''} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} min={0} />
                  </div>
                  <p className="text-gray-500">Tax ({taxRate}%): <strong className="text-gray-900 dark:text-white">{formatCurrency(taxAmount)}</strong></p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white border-t pt-2">Total: {formatCurrency(total)}</p>
                </div>
              </div>
            </div>

            {/* Payment & Notes */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
                <select className={inputClass} value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value as any })}>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
                <input className={inputClass} placeholder="Cash / UPI / Bank Transfer" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} />
              </div>
            </div>
            <textarea className={cn(inputClass, 'mb-6')} placeholder="Notes (optional)" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

            <button onClick={handleCreate} disabled={saving} className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {saving ? 'Creating…' : 'Create Invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {viewInvoice && (
        <InvoicePrintView invoice={viewInvoice} company={company} onClose={() => setViewInvoice(null)} />
      )}
    </div>
  );
}
