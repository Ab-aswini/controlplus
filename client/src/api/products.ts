import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const getProducts = async (params?: {
  type?: string;
  category?: string;
  featured?: boolean;
  search?: string;
}): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*, product_images(*)');

  if (params?.type) query = query.eq('type', params.type);
  if (params?.category) query = query.eq('category', params.category);
  if (params?.featured) query = query.eq('featured', true);
  if (params?.search) query = query.ilike('name', `%${params.search}%`);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map(p => ({
    ...p,
    images: p.product_images || [],
  })) as Product[];
};

export const getProduct = async (slug: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return { ...data, images: data.product_images || [] } as Product;
};

export const createProduct = async (product: Partial<Product>) => {
  const slug = product.name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || '';

  // Strip virtual fields that don't exist on the DB table
  const { images, ...dbFields } = product as any;

  const { data, error } = await supabase
    .from('products')
    .insert({ ...dbFields, slug })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  // Strip virtual fields and timestamps that don't belong in UPDATE
  const { images, created_at, updated_at, id: _id, slug: _slug, ...dbFields } = product as any;

  // Regenerate slug if name changed
  if (dbFields.name) {
    dbFields.slug = dbFields.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data, error } = await supabase
    .from('products')
    .update(dbFields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
