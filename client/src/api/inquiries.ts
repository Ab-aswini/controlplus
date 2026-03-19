import { supabase } from '../lib/supabase';
import { Inquiry } from '../types';

export const submitInquiry = async (inquiry: {
  name: string;
  phone: string;
  email?: string;
  product_id?: string;
  message?: string;
  source?: string;
}) => {
  const { data, error } = await supabase
    .from('inquiries')
    .insert(inquiry)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getInquiries = async (status?: string): Promise<Inquiry[]> => {
  let query = supabase
    .from('inquiries')
    .select('*, products(name)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(inq => ({
    ...inq,
    product_name: (inq.products as any)?.name || null,
    products: undefined,
  })) as Inquiry[];
};

export const updateInquiryStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteInquiry = async (id: string) => {
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
