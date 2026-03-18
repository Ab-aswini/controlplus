import api from './client';
import { Product } from '../types';

export const getProducts = async (params?: { type?: string; category?: string; featured?: boolean; search?: string }) => {
  const { data } = await api.get<Product[]>('/products', { params });
  return data;
};

export const getProduct = async (slug: string) => {
  const { data } = await api.get<Product>(`/products/${slug}`);
  return data;
};

export const createProduct = async (product: Partial<Product>) => {
  const { data } = await api.post('/products', product);
  return data;
};

export const updateProduct = async (id: number, product: Partial<Product>) => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: number) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
