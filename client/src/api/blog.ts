import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

export const getPosts = async (published?: boolean): Promise<BlogPost[]> => {
  let query = supabase
    .from('blog')
    .select('*')
    .order('created_at', { ascending: false });

  if (published !== undefined) query = query.eq('published', published);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as BlogPost[];
};

export const getPost = async (slug: string): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as BlogPost;
};

export const createPost = async (post: Partial<BlogPost>) => {
  let slug = post.title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || '';

  // Check for slug collision
  const { data: existing } = await supabase
    .from('blog')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const { data, error } = await supabase
    .from('blog')
    .insert({ ...post, slug, author: post.author || 'Admin' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePost = async (id: string, post: Partial<BlogPost>) => {
  const { data, error } = await supabase
    .from('blog')
    .update(post)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePost = async (id: string) => {
  const { error } = await supabase
    .from('blog')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
