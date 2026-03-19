import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';
import Skeleton from '../../components/ui/Skeleton';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  category: string;
  type: 'software' | 'hardware';
  description: string;
  short_description: string;
  price: string;
  condition: string;
  stock_status: string;
  warranty_info: string;
  specs: string;
  featured: boolean;
}

const emptyForm: ProductFormData = {
  name: '', category: '', type: 'software', description: '', short_description: '',
  price: '', condition: '', stock_status: 'in_stock', warranty_info: '', specs: '', featured: false,
};

export default function ProductsManagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [productImages, setProductImages] = useState<{id: string; image_url: string}[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setProductImages([]); setShowForm(true); };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, category: p.category, type: p.type,
      description: p.description || '', short_description: p.short_description || '',
      price: p.price?.toString() || '', condition: p.condition || '',
      stock_status: p.stock_status, warranty_info: p.warranty_info || '',
      specs: p.specs ? JSON.stringify(p.specs, null, 2) : '', featured: !!p.featured,
    });
    setEditId(p.id);
    setShowForm(true);
    // Load existing images
    loadProductImages(p.id);
  };

  const loadProductImages = async (productId: string) => {
    const { data } = await supabase.from('product_images').select('id, image_url').eq('product_id', productId);
    setProductImages((data || []).map(img => ({ id: img.id, image_url: img.image_url })));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${productId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
        await supabase.from('product_images').insert({ product_id: productId, image_url: publicUrl });
      }
      await loadProductImages(productId);
      toast.success('Images uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    await supabase.from('product_images').delete().eq('id', imageId);
    setProductImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        price: form.price ? parseFloat(form.price) : null,
        condition: form.condition || null,
        specs: form.specs ? JSON.parse(form.specs) : null,
        featured: form.featured,
      };
      if (editId) {
        await updateProduct(editId, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      load();
      toast.success(editId ? 'Product updated' : 'Product created');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">{products.length} products</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                    {p.featured ? <span className="text-xs text-amber-600">Featured</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', p.type === 'software' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300')}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.category}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium', p.stock_status === 'in_stock' ? 'text-green-600' : 'text-red-500')}>
                      {p.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" aria-label="Edit Product" title="Edit Product">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" aria-label="Delete Product" title="Delete Product">
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full mt-16 mb-8 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close form" title="Close form"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" placeholder="Product Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  aria-label="Product Type" title="Product Type">
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                </select>
                <input type="text" placeholder="Category *" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <input type="text" placeholder="Short Description" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              <textarea placeholder="Full Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price (INR)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
                <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  aria-label="Product Condition" title="Product Condition">
                  <option value="">No Condition</option>
                  <option value="new">New</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={form.stock_status} onChange={e => setForm({ ...form, stock_status: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  aria-label="Stock Status" title="Stock Status">
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <input type="text" placeholder="Warranty Info" value={form.warranty_info} onChange={e => setForm({ ...form, warranty_info: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <textarea placeholder='Specs (JSON, e.g. {"ram":"8GB"})' rows={2} value={form.specs} onChange={e => setForm({ ...form, specs: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-xs" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Featured Product</span>
              </label>

              {/* Image Upload (only in edit mode, after product exists) */}
              {editId && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Product Images</h4>
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg cursor-pointer hover:bg-primary-100">
                      <Upload className="w-3 h-3" />{uploading ? 'Uploading…' : 'Upload'}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e, editId)} disabled={uploading} />
                    </label>
                  </div>
                  {productImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {productImages.map(img => (
                        <div key={img.id} className="relative group">
                          <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <button onClick={() => deleteImage(img.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete image" title="Delete image">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No images yet. Upload to add.</p>
                  )}
                </div>
              )}
              {!editId && (
                <p className="text-xs text-gray-400">💡 Save the product first, then edit it to upload images.</p>
              )}

              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : editId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
