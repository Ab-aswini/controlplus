import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Star, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
}

interface FormData {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  published: boolean;
}

const emptyForm: FormData = { name: '', role: '', company: '', quote: '', rating: 5, published: true };
const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm';

export default function TestimonialsManagePage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };

  const openEdit = (t: Testimonial) => {
    setForm({ name: t.name, role: t.role, company: t.company, quote: t.quote, rating: t.rating, published: t.published });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.quote) {
      toast.error('Name and quote are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from('testimonials').update(form).eq('id', editId);
        if (error) throw error;
        toast.success('Testimonial updated');
      } else {
        const maxOrder = items.length > 0 ? Math.max(...items.map(t => t.sort_order)) + 1 : 0;
        const { error } = await supabase.from('testimonials').insert({ ...form, sort_order: maxOrder });
        if (error) throw error;
        toast.success('Testimonial added');
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (t: Testimonial) => {
    try {
      const { error } = await supabase.from('testimonials').update({ published: !t.published }).eq('id', t.id);
      if (error) throw error;
      toast.success(t.published ? 'Unpublished' : 'Published');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">{items.length} testimonials</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">No testimonials yet</p>
            <p className="text-sm">Add client reviews to display on the homepage</p>
          </div>
        ) : items.map(t => (
          <div key={t.id} className={cn(
            'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-opacity',
            !t.published && 'opacity-60'
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">"{t.quote}"</p>
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}{t.company && `, ${t.company}`}</p>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => togglePublished(t)} className={cn('p-1.5 rounded transition-colors', t.published ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100')} title={t.published ? 'Unpublish' : 'Publish'} aria-label={t.published ? 'Unpublish' : 'Publish'}>
                  {t.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" title="Edit" aria-label="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input className={inputClass} placeholder="Client Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Role (e.g. Owner)" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                <input className={inputClass} placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
              <textarea className={cn(inputClass, 'resize-none')} rows={4} placeholder="Review / Quote *" value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} />
              
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className="p-0.5" aria-label={`${n} stars`}>
                      <Star className={cn('w-6 h-6 transition-colors', n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300')} />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Published (visible on homepage)</span>
              </label>

              <button onClick={handleSave} disabled={saving || !form.name || !form.quote}
                className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : editId ? 'Update' : 'Add Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
