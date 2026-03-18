import api from './client';
import { BlogPost } from '../types';

export const getPosts = async (published?: boolean) => {
  const { data } = await api.get<BlogPost[]>('/blog', { params: published !== undefined ? { published } : {} });
  return data;
};

export const getPost = async (slug: string) => {
  const { data } = await api.get<BlogPost>(`/blog/${slug}`);
  return data;
};

export const createPost = async (post: Partial<BlogPost>) => {
  const { data } = await api.post('/blog', post);
  return data;
};

export const updatePost = async (id: number, post: Partial<BlogPost>) => {
  const { data } = await api.put(`/blog/${id}`, post);
  return data;
};

export const deletePost = async (id: number) => {
  const { data } = await api.delete(`/blog/${id}`);
  return data;
};
