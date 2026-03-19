import { useState, useEffect } from 'react';
import { Save, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { updateSetting, OrderChannels, ContactInfo, InvoiceSettings } from '../../api/settings';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {enabled ? (
        <ToggleRight className="w-8 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <ToggleLeft className="w-8 h-5 text-gray-400 flex-shrink-0" />
      )}
      <span className={cn('text-sm font-medium', enabled ? 'text-gray-900 dark:text-white' : 'text-gray-500')}>{label}</span>
    </button>
  );
}

export default function SettingsPage() {
  const { settings, reload } = useSettings();
  const [saving, setSaving] = useState<string | null>(null);

  // Order Channels
  const [channels, setChannels] = useState<OrderChannels>({
    email: true, whatsapp: true, inquiry_form: true, online_payment: false,
  });

  // Contact Info
  const [contact, setContact] = useState<ContactInfo>({
    email: '', phone: '', whatsapp: '', address: '',
  });

  // Invoice Settings
  const [invoice, setInvoice] = useState<InvoiceSettings>({
    company_name: '', gstin: '', tax_rate: 18, prefix: 'INV', next_number: 1,
  });

  useEffect(() => {
    if (settings) {
      setChannels(settings.order_channels);
      setContact(settings.contact_info);
      setInvoice(settings.invoice_settings);
    }
  }, [settings]);

  const saveSection = async (key: string, value: any) => {
    setSaving(key);
    try {
      await updateSetting(key as any, value);
      await reload();
      toast.success('Settings saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Order Channels */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Channels</h2>
          <p className="text-sm text-gray-500 mt-1">Control which ordering options customers see on products</p>
        </div>
        <div className="p-4 space-y-1">
          <Toggle label="📧 Email — Pre-filled mailto link" enabled={channels.email} onChange={v => setChannels({ ...channels, email: v })} />
          <Toggle label="💬 WhatsApp — Direct chat to order" enabled={channels.whatsapp} onChange={v => setChannels({ ...channels, whatsapp: v })} />
          <Toggle label="📋 Inquiry Form — Built-in contact form" enabled={channels.inquiry_form} onChange={v => setChannels({ ...channels, inquiry_form: v })} />
          <Toggle label="💳 Online Payment — Pay via gateway" enabled={channels.online_payment} onChange={v => setChannels({ ...channels, online_payment: v })} />
        </div>
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button onClick={() => saveSection('order_channels', channels)} disabled={saving === 'order_channels'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
            {saving === 'order_channels' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Channels
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h2>
          <p className="text-sm text-gray-500 mt-1">Used in email / WhatsApp links and footer</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Email</label>
            <input className={inputClass} value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="info@company.in" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input className={inputClass} value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp Number</label>
            <input className={inputClass} value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} placeholder="919876543210" />
            <p className="text-xs text-gray-400 mt-1">Country code + number, no spaces/dashes</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Address</label>
            <input className={inputClass} value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} placeholder="Shop No. 12, Business Hub" />
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button onClick={() => saveSection('contact_info', contact)} disabled={saving === 'contact_info'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
            {saving === 'contact_info' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Contact
          </button>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your printable bill / invoice details</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
            <input className={inputClass} value={invoice.company_name} onChange={e => setInvoice({ ...invoice, company_name: e.target.value })} placeholder="Your Company Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GSTIN</label>
            <input className={inputClass} value={invoice.gstin} onChange={e => setInvoice({ ...invoice, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
            <input type="number" className={inputClass} value={invoice.tax_rate} onChange={e => setInvoice({ ...invoice, tax_rate: Number(e.target.value) })} placeholder="18" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Prefix</label>
            <input className={inputClass} value={invoice.prefix} onChange={e => setInvoice({ ...invoice, prefix: e.target.value })} placeholder="INV" />
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button onClick={() => saveSection('invoice_settings', invoice)} disabled={saving === 'invoice_settings'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
            {saving === 'invoice_settings' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Invoice Settings
          </button>
        </div>
      </div>
    </div>
  );
}
