import api from './client';
import { Inquiry } from '../types';

export const submitInquiry = async (inquiry: { name: string; phone: string; email?: string; product_id?: number; message?: string; source?: string }) => {
  const { data } = await api.post('/inquiries', inquiry);
  return data;
};

export const getInquiries = async (status?: string) => {
  const { data } = await api.get<Inquiry[]>('/inquiries', { params: status ? { status } : {} });
  return data;
};

export const updateInquiryStatus = async (id: number, status: string) => {
  const { data } = await api.put(`/inquiries/${id}/status`, { status });
  return data;
};

export const deleteInquiry = async (id: number) => {
  const { data } = await api.delete(`/inquiries/${id}`);
  return data;
};
