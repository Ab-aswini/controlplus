import api from './client';
import { Order } from '../types';

export const getOrders = async (status?: string) => {
  const { data } = await api.get<Order[]>('/orders', { params: status ? { status } : {} });
  return data;
};

export const createOrder = async (order: Partial<Order>) => {
  const { data } = await api.post('/orders', order);
  return data;
};

export const updateOrder = async (id: number, order: Partial<Order>) => {
  const { data } = await api.put(`/orders/${id}`, order);
  return data;
};

export const updateOrderStatus = async (id: number, status: string) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};

export const deleteOrder = async (id: number) => {
  const { data } = await api.delete(`/orders/${id}`);
  return data;
};
