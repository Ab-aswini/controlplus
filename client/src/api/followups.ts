import { supabase } from '../lib/supabase';
import { FollowUp } from '../types';


export const getFollowUps = async (inquiryId: string): Promise<FollowUp[]> => {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as FollowUp[];
};

export const getPendingFollowUps = async (): Promise<(FollowUp & { inquiry_name?: string })[]> => {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, inquiries(name)')
    .eq('completed', false)
    .not('next_follow_up', 'is', null)
    .order('next_follow_up', { ascending: true });

  if (error) throw error;
  return (data || []).map(f => ({
    ...f,
    inquiry_name: (f.inquiries as any)?.name || null,
    inquiries: undefined,
  })) as (FollowUp & { inquiry_name?: string })[];
};

export const createFollowUp = async (followUp: {
  inquiry_id: string;
  type: string;
  summary: string;
  next_follow_up?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('follow_ups')
    .insert({ ...followUp, user_id: user?.id || null })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const completeFollowUp = async (id: string) => {
  const { data, error } = await supabase
    .from('follow_ups')
    .update({ completed: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFollowUp = async (id: string) => {
  const { error } = await supabase
    .from('follow_ups')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
