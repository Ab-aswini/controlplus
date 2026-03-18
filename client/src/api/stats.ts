import api from './client';
import { Stats, FAQ } from '../types';

export const getStats = async () => {
  const { data } = await api.get<Stats>('/stats');
  return data;
};

export const getFaqs = async () => {
  const { data } = await api.get<FAQ[]>('/faqs');
  return data;
};
