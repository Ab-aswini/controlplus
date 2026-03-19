import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, ArrowUpDown } from 'lucide-react';
import { Service } from '../../types';
import { getServices, createService, updateService, deleteService } from '../../api/services';
import { cn } from '../../utils/cn';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'sonner';

interface ServiceFormData {
  title: string;
  description: string;
  type: 'software' | 'hardware' | 'support';
  features: string;
  product_link: string;
  sort_order: string;
  published: boolean;
}

const emptyForm: ServiceFormData = {
  title: '', description: '', type: 'software', features: '',
  product_link: '', sort_order: '0', published: true,
};

export default function ServicesManagePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'software' | 'hardware' | 'support'>('software');

  const load = () => {
    setLoading(true);
    getServices().then(setServices).catch(() => toast.error('Failed to load services')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };

  const openEdit = (s: Service) => {
    setForm({
      title: s.title,
      description: s.description || '',
      type: s.type,
      features: (s.features || []).join(', '),
      product_link: s.product_link || '',
      sort_order: s.sort_order?.toString() || '0',
      published: s.published,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload: Partial<Service> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        features: form.features.split(',').map(f => f.trim()).filter(Boolean),
        product_link: form.product_link.trim() || null,
        sort_order: parseInt(form.sort_order) || 0,
        published: form.published,
      };
      if (editId) {
        await updateService(editId, payload);
        toast.success('Service updated');
      } else {
        await createService(payload);
        toast.success('Service created');
      }
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteService(id);
      toast.success('Service deleted');
      load();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const togglePublish = async (s: Service) => {
    try {
      await updateService(s.id, { published: !s.published });
      toast.success(s.published ? 'Service unpublished' : 'Service published');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const filtered = services.filter(s => s.type === activeTab).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Services</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Control what appears on the public Services page</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium" aria-label="Add Service">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {(['software', 'hardware', 'support'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize',
              activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Service List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No {activeTab} services yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Order</span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Product Link</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{s.sort_order}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{s.description}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {s.product_link ? (
                      <span className="text-xs bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">{s.product_link}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(s)}
                      className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors', s.published ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400')}
                      aria-label={s.published ? 'Unpublish' : 'Publish'}
                      title={s.published ? 'Published — Click to unpublish' : 'Unpublished — Click to publish'}
                    >
                      {s.published ? <><Eye className="w-3 h-3" /> Live</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" aria-label={`Edit ${s.title}`} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.title)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" aria-label={`Delete ${s.title}`} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editId ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close" title="Close"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="svc-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input id="svc-title" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Billing & Invoicing" />
              </div>

              <div>
                <label htmlFor="svc-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea id="svc-desc" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Brief description of this service" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="svc-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select id="svc-type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as ServiceFormData['type'] })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" title="Service Type">
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="svc-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                  <input id="svc-order" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="0" />
                </div>
              </div>

              <div>
                <label htmlFor="svc-features" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features <span className="text-gray-400 text-xs">(comma separated)</span></label>
                <input id="svc-features" type="text" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="Feature 1, Feature 2, Feature 3" />
              </div>

              <div>
                <label htmlFor="svc-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Link <span className="text-gray-400 text-xs">(optional)</span></label>
                <input id="svc-link" type="text" value={form.product_link} onChange={e => setForm({ ...form, product_link: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="/products?type=software&category=billing" />
              </div>

              <div className="flex items-center gap-3">
                <input id="svc-published" type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="svc-published" className="text-sm text-gray-700 dark:text-gray-300">Published (visible on public site)</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
