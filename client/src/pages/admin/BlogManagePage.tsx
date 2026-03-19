import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '../../types';
import { getPosts, createPost, updatePost, deletePost } from '../../api/blog';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'sonner';

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  cover_image: string;
  published: boolean;
}

const emptyForm: BlogFormData = { title: '', content: '', excerpt: '', cover_image: '', published: false };

export default function BlogManagePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    getPosts().then(setPosts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };

  const openEdit = (p: BlogPost) => {
    setForm({ title: p.title, content: p.content, excerpt: p.excerpt || '', cover_image: p.cover_image || '', published: !!p.published });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `covers/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path);
      setForm(prev => ({ ...prev, cover_image: publicUrl }));
      toast.success('Cover image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updatePost(editId, form);
      } else {
        await createPost(form);
      }
      setShowForm(false);
      toast.success(editId ? 'Post updated' : 'Post created');
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save post');
    } finally { setSaving(false); }
  };

  const togglePublished = async (p: BlogPost) => {
    try {
      await updatePost(p.id, { published: !p.published } as any);
      toast.success(p.published ? 'Post unpublished' : 'Post published');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try { await deletePost(id); toast.success('Post deleted'); load(); } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">{posts.length} posts</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500">Author</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" /></td>)}
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No blog posts yet</td></tr>
              ) : posts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500">{p.author}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublished(p)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${p.published ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {p.published ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" title="Edit Post" aria-label="Edit Post">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete Post" aria-label="Delete Post">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/50 overflow-y-auto" onClick={() => setShowForm(false)} aria-hidden="true">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mt-16 mb-8 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editId ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" placeholder="Post Title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-lg font-medium" />
              <input type="text" placeholder="Excerpt (short summary)" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />

              {/* Cover Image */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Cover Image</h4>
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg cursor-pointer hover:bg-primary-100">
                    <Upload className="w-3 h-3" />{uploading ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
                  </label>
                </div>
                {form.cover_image ? (
                  <div className="relative">
                    <img src={form.cover_image} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                    <button type="button" onClick={() => setForm({ ...form, cover_image: '' })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full" aria-label="Remove cover image" title="Remove cover image">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No cover image. Upload one to display with the post.</p>
                )}
              </div>

              <textarea placeholder="Content (supports markdown-style ## headings and - lists)" required rows={12} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Publish immediately</span>
              </label>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editId ? 'Update Post' : 'Create Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
