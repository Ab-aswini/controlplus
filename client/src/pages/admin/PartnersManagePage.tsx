import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  type: 'technology' | 'client';
  sort_order: number;
  website_url: string | null;
}

const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm';

export default function PartnersManagePage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'technology' | 'client'>('technology');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '' });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('partners').select('*').order('sort_order');
    if (error) toast.error('Failed to load partners');
    setPartners(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = partners.filter(p => p.type === activeTab);

  const openCreate = () => {
    setForm({ name: '', logo_url: '', website_url: '' });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (p: Partner) => {
    setForm({ name: p.name, logo_url: p.logo_url || '', website_url: p.website_url || '' });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${activeTab}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('partner-logos').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('partner-logos').getPublicUrl(path);
      setForm(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        // UPDATE existing partner
        const { error } = await supabase.from('partners').update({
          name: form.name,
          logo_url: form.logo_url || '',
          website_url: form.website_url || null,
        }).eq('id', editId);
        if (error) throw error;
        toast.success('Partner updated');
      } else {
        // INSERT new partner
        if (!form.logo_url) {
          toast.error('Please upload a logo');
          setSaving(false);
          return;
        }
        const maxOrder = filtered.length > 0 ? Math.max(...filtered.map(p => p.sort_order)) + 1 : 0;
        const { error } = await supabase.from('partners').insert({
          name: form.name,
          logo_url: form.logo_url,
          type: activeTab,
          sort_order: maxOrder,
          website_url: form.website_url || null,
        });
        if (error) throw error;
        toast.success('Partner added');
      }
      setShowForm(false);
      setForm({ name: '', logo_url: '', website_url: '' });
      setEditId(null);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this partner?')) return;
    try {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Removed');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
          <button
            onClick={() => setActiveTab('technology')}
            className={cn('px-4 py-2 text-sm font-medium rounded-md transition-colors', activeTab === 'technology' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400')}
          >
            🤝 Technology Partners ({partners.filter(p => p.type === 'technology').length})
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={cn('px-4 py-2 text-sm font-medium rounded-md transition-colors', activeTab === 'client' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400')}
          >
            👥 Our Clients ({partners.filter(p => p.type === 'client').length})
          </button>
        </div>
        <div className="ml-auto">
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Add {activeTab === 'technology' ? 'Partner' : 'Client'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No {activeTab === 'technology' ? 'technology partners' : 'clients'} yet</p>
            <p className="text-sm">Click "Add" to start adding</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(partner => (
              <div key={partner.id} className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 min-h-[100px]">
                {/* Logo or initial */}
                {partner.logo_url ? (
                  <img src={partner.logo_url} alt={partner.name} className="h-14 w-auto max-w-full object-contain" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-bold text-xl">
                    {partner.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center truncate w-full">{partner.name}</span>
                {partner.website_url && (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary-500 hover:underline flex items-center gap-0.5">
                    <ExternalLink className="w-2.5 h-2.5" /> website
                  </a>
                )}

                {/* Hover actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(partner)}
                    className="p-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full shadow-sm hover:text-primary-600 transition-colors"
                    aria-label="Edit partner" title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="p-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full shadow-sm hover:text-red-600 transition-colors"
                    aria-label="Delete partner" title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editId ? 'Edit' : 'Add'} {activeTab === 'technology' ? 'Technology Partner' : 'Client'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input className={inputClass} placeholder="Partner name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                <input className={inputClass} placeholder="https://example.com (optional)" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} />
              </div>
              
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo {!editId && '*'}</label>
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                  {form.logo_url ? (
                    <div className="space-y-2">
                      <img src={form.logo_url} alt="Logo preview" className="h-16 mx-auto object-contain" />
                      <div className="flex items-center justify-center gap-3">
                        <label className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer">
                          Replace
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                        </label>
                        <button type="button" onClick={() => setForm({ ...form, logo_url: '' })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500">{uploading ? 'Uploading…' : 'Click to upload logo'}</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving || !form.name}
                className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : editId ? 'Update Partner' : 'Add Partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
