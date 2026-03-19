import { supabase } from '../lib/supabase';
import { Service } from '../types';

export const getServices = async (publishedOnly = false): Promise<Service[]> => {
  let query = supabase.from('services').select('*');
  if (publishedOnly) query = query.eq('published', true);
  const { data, error } = await query.order('type').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as Service[];
};

export const createService = async (service: Partial<Service>) => {
  const { id, created_at, updated_at, ...dbFields } = service as any;
  const { data, error } = await supabase
    .from('services')
    .insert(dbFields)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateService = async (id: string, service: Partial<Service>) => {
  const { id: _id, created_at, updated_at, ...dbFields } = service as any;
  const { data, error } = await supabase
    .from('services')
    .update(dbFields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteService = async (id: string) => {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
};
