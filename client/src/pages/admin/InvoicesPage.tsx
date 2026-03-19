import { useState, useEffect, useRef } from 'react';
import { Plus, Printer, Trash2, Receipt, Loader2, X, Eye, IndianRupee, TrendingUp, Clock, CheckCircle2, CreditCard, Edit2 } from 'lucide-react';
import { Invoice, InvoiceItem, getInvoices, createInvoice, updateInvoice, deleteInvoice, generateInvoiceNumber, updatePaymentStatus, recordPayment, getPaymentHistory, PaymentRecord } from '../../api/invoices';
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
          <div className="inv-header">
            <div>
              <div className="inv-company">{company.name}</div>
              <p className="inv-sub">{company.address}</p>
              <p className="inv-sub">{company.phone} • {company.email}</p>
              {company.gstin && <p className="inv-sub">GSTIN: {company.gstin}</p>}
            </div>
            <div className="inv-right">
              <div className="inv-title">INVOICE</div>
              <p className="inv-num">{invoice.invoice_number}</p>
              <p className="inv-num">{formatDate(invoice.created_at)}</p>
              <span className={`inv-status inv-status-${invoice.payment_status}`}>
                {invoice.payment_status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="inv-meta">
            <div>
              <h4 className="inv-meta-label">Bill To</h4>
              <p className="inv-meta-bold">{invoice.customer_name}</p>
              {invoice.customer_phone && <p className="inv-num">{invoice.customer_phone}</p>}
              {invoice.customer_email && <p className="inv-num">{invoice.customer_email}</p>}
              {invoice.customer_address && <p className="inv-num">{invoice.customer_address}</p>}
            </div>
            <div className="inv-right">
              <h4 className="inv-meta-label">Payment Method</h4>
              <p className="inv-meta-val">{invoice.payment_method || 'N/A'}</p>
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th className="inv-th">#</th>
                <th className="inv-th">Item</th>
                <th className="inv-th-right">Qty</th>
                <th className="inv-th-right">Rate</th>
                <th className="inv-th-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="inv-td">{i + 1}</td>
                  <td className="inv-td">
                    <strong>{item.name}</strong>
                    {item.description && <p className="inv-item-desc">{item.description}</p>}
                  </td>
                  <td className="inv-td-right">{item.qty}</td>
                  <td className="inv-td-right">{formatCurrency(item.price)}</td>
                  <td className="inv-td-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="inv-total-row">
              <span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="inv-total-discount">
                <span>Discount</span><span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="inv-total-row">
              <span>Tax ({invoice.tax_rate}%)</span><span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="inv-total-grand">
              <span>Total</span><span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="inv-notes">
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
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentModal, setPaymentModal] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', reference: '', notes: '' });
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [savingPayment, setSavingPayment] = useState(false);

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

  const handleSave = async () => {
    if (!form.customer_name || items.length === 0 || !items[0].name) {
      toast.error('Please fill customer name and at least one item');
      return;
    }
    setSaving(true);
    try {
      if (editingInvoice) {
        // Update existing invoice
        await updateInvoice(editingInvoice.id, {
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
          notes: form.notes || null,
        });
        toast.success('Invoice updated!');
      } else {
        // Create new invoice
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
      }

      closeModal();
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${editingInvoice ? 'update' : 'create'} invoice`);
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setEditingInvoice(null);
    setForm({ customer_name: '', customer_phone: '', customer_email: '', customer_address: '', payment_status: 'unpaid', payment_method: '', notes: '', discount: 0 });
    setItems([{ name: '', description: '', qty: 1, price: 0, total: 0 }]);
    setShowCreate(true);
  };

  const openEditModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setForm({
      customer_name: inv.customer_name || '',
      customer_phone: inv.customer_phone || '',
      customer_email: inv.customer_email || '',
      customer_address: inv.customer_address || '',
      payment_status: inv.payment_status,
      payment_method: inv.payment_method || '',
      notes: inv.notes || '',
      discount: inv.discount || 0,
    });
    setItems(inv.items && inv.items.length > 0 ? inv.items : [{ name: '', description: '', qty: 1, price: 0, total: 0 }]);
    setShowCreate(true);
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditingInvoice(null);
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

  // Revenue stats
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidRevenue = invoices.filter(i => i.payment_status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const unpaidRevenue = invoices.filter(i => i.payment_status === 'unpaid').reduce((sum, i) => sum + i.total, 0);
  const partialRevenue = invoices.filter(i => i.payment_status === 'partial').reduce((sum, i) => sum + i.total, 0);
  const filteredInvoices = statusFilter ? invoices.filter(i => i.payment_status === statusFilter) : invoices;

  const handlePaymentStatusChange = async (inv: Invoice, newStatus: 'unpaid' | 'partial' | 'paid') => {
    if (newStatus === 'partial') {
      // Open payment modal to record partial payment
      setPaymentModal(inv);
      setPaymentForm({ amount: '', method: 'cash', reference: '', notes: '' });
      try {
        const history = await getPaymentHistory(inv.id);
        setPaymentHistory(history);
      } catch { setPaymentHistory([]); }
      return;
    }
    try {
      const paidAmount = newStatus === 'paid' ? inv.total : 0;
      await updatePaymentStatus(inv.id, newStatus, paidAmount);
      if (newStatus === 'paid') {
        await recordPayment({ invoice_id: inv.id, amount: inv.total - ((inv as any).paid_amount || 0), method: 'cash', reference: null, notes: 'Marked as fully paid' });
      }
      toast.success(`Invoice ${inv.invoice_number} marked as ${newStatus}`);
      fetchInvoices();
    } catch { toast.error('Failed to update status'); }
  };

  const handleRecordPayment = async () => {
    if (!paymentModal || !paymentForm.amount) return;
    setSavingPayment(true);
    try {
      const amount = parseFloat(paymentForm.amount);
      await recordPayment({
        invoice_id: paymentModal.id,
        amount,
        method: paymentForm.method,
        reference: paymentForm.reference || null,
        notes: paymentForm.notes || null,
      });
      const prevPaid = (paymentModal as any).paid_amount || 0;
      const newPaid = prevPaid + amount;
      const newStatus = newPaid >= paymentModal.total ? 'paid' : 'partial';
      await updatePaymentStatus(paymentModal.id, newStatus, newPaid);
      toast.success(`₹${amount.toLocaleString('en-IN')} payment recorded`);
      setPaymentModal(null);
      fetchInvoices();
    } catch { toast.error('Failed to record payment'); }
    finally { setSavingPayment(false); }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm';
  const STATUS_TABS = [{ value: '', label: 'All' }, { value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' }];

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center"><IndianRupee className="w-4 h-4 text-blue-600" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase">Total Revenue</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoices.length} invoices</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase">Paid</span>
          </div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(paidRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoices.filter(i => i.payment_status === 'paid').length} invoices</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center"><Clock className="w-4 h-4 text-red-600" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase">Unpaid</span>
          </div>
          <p className="text-xl font-bold text-red-600">{formatCurrency(unpaidRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoices.filter(i => i.payment_status === 'unpaid').length} invoices</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-amber-600" /></div>
            <span className="text-xs font-medium text-gray-500 uppercase">Partial</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(partialRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoices.filter(i => i.payment_status === 'partial').length} invoices</p>
        </div>
      </div>

      {/* Header + Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', statusFilter === tab.value ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" /></div>
      ) : filteredInvoices.length === 0 ? (
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{inv.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={inv.payment_status}
                      onChange={e => handlePaymentStatusChange(inv, e.target.value as 'unpaid' | 'partial' | 'paid')}
                      aria-label={`Payment status for ${inv.invoice_number}`}
                      title="Update payment status"
                      className={cn('text-xs font-medium px-2 py-1 rounded-lg border-0 outline-none cursor-pointer', STATUS_COLORS[inv.payment_status])}
                    >
                      <option value="unpaid">unpaid</option>
                      <option value="partial">partial</option>
                      <option value="paid">paid</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {inv.payment_status === 'paid' ? (
                      <span className="text-green-600 font-medium">{formatCurrency(inv.total)}</span>
                    ) : (inv as any).paid_amount > 0 ? (
                      <button onClick={() => { setPaymentModal(inv); setPaymentForm({ amount: '', method: 'cash', reference: '', notes: '' }); getPaymentHistory(inv.id).then(setPaymentHistory).catch(() => setPaymentHistory([])); }}
                        className="text-amber-600 font-medium hover:underline cursor-pointer">
                        {formatCurrency((inv as any).paid_amount)} <span className="text-gray-400">/ {formatCurrency(inv.total)}</span>
                      </button>
                    ) : inv.payment_status === 'unpaid' ? (
                      <button onClick={() => handlePaymentStatusChange(inv, 'partial')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        + Record Payment
                      </button>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inv.created_at)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEditModal(inv)} className="p-1.5 text-gray-500 hover:text-primary-600" title="Edit" aria-label={`Edit invoice ${inv.invoice_number}`}><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setViewInvoice(inv)} className="p-1.5 text-gray-500 hover:text-primary-600 ml-1" title="View & Print" aria-label={`View invoice ${inv.invoice_number}`}><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-gray-500 hover:text-red-600 ml-1" title="Delete" aria-label={`Delete invoice ${inv.invoice_number}`}><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingInvoice ? `Edit Invoice (${editingInvoice.invoice_number})` : 'Create Invoice'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5" /></button>
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
                      title="Select product"
                      aria-label="Select product"
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
                      <button onClick={() => removeItem(i)} className="p-2 text-red-500 hover:text-red-700" aria-label={`Remove item ${i + 1}`} title="Remove item"><Trash2 className="w-4 h-4" /></button>
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
                    <input type="number" placeholder="0" className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-right text-sm text-gray-900 dark:text-white" value={form.discount || ''} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} min={0} />
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
                <select title="Payment Status" className={inputClass} value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value as any })}>
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

            <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {saving ? (editingInvoice ? 'Updating…' : 'Creating…') : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {viewInvoice && (
        <InvoicePrintView invoice={viewInvoice} company={company} onClose={() => setViewInvoice(null)} />
      )}

      {/* Payment Recording Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setPaymentModal(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Record Payment</h3>
                  <p className="text-xs text-gray-500">{paymentModal.invoice_number}</p>
                </div>
              </div>
              <button onClick={() => setPaymentModal(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close payment modal"><X className="w-5 h-5" /></button>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Paid: {formatCurrency((paymentModal as any).paid_amount || 0)}</span>
                <span className="text-gray-500">Total: {formatCurrency(paymentModal.total)}</span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 w-[${Math.min(100, Math.round(((paymentModal as any).paid_amount || 0) / paymentModal.total * 100))}%]`}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Remaining: {formatCurrency(paymentModal.total - ((paymentModal as any).paid_amount || 0))}
              </p>
            </div>

            {/* Payment Form */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Amount *</label>
                <input type="number" min="0" step="0.01" value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder={`Max: ${(paymentModal.total - ((paymentModal as any).paid_amount || 0)).toFixed(2)}`}
                  className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Method</label>
                <select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className={inputClass} title="Payment method" aria-label="Payment method">
                  <option value="cash">💵 Cash</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                  <option value="upi">📱 UPI</option>
                  <option value="card">💳 Card</option>
                  <option value="cheque">📝 Cheque</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Reference # (optional)</label>
                <input type="text" value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  placeholder="Transaction ID, cheque #, etc."
                  className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Notes (optional)</label>
                <input type="text" value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Any notes about this payment"
                  className={inputClass} />
              </div>
            </div>

            <button onClick={handleRecordPayment} disabled={savingPayment || !paymentForm.amount}
              className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors mb-4">
              {savingPayment ? 'Recording…' : `Record ₹${paymentForm.amount ? parseFloat(paymentForm.amount).toLocaleString('en-IN') : '0'} Payment`}
            </button>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment History</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {paymentHistory.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(p.amount)}
                          <span className="ml-2 text-xs text-gray-400">{p.method.replace('_', ' ')}</span>
                        </p>
                        {p.reference && <p className="text-xs text-gray-400">Ref: {p.reference}</p>}
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
