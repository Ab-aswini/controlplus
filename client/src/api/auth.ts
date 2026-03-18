import api from './client';
import { User } from '../types';

export const login = async (email: string, password: string) => {
  const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};
