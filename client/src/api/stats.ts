import { supabase } from '../lib/supabase';
import { Stats, FAQ } from '../types';

export interface OrderStatusBreakdown {
  pending: number;
  confirmed: number;
  delivered: number;
  cancelled: number;
}

export interface InquiryStatusBreakdown {
  new: number;
  contacted: number;
  closed: number;
}

export const getStats = async (): Promise<Stats> => {
  const [products, inquiries, newInquiries, orders, pendingOrders, blogPosts, services, partners, testimonials, invoices] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('blog').select('id', { count: 'exact', head: true }),
    supabase.from('services').select('id', { count: 'exact', head: true }),
    supabase.from('partners').select('id', { count: 'exact', head: true }),
    supabase.from('testimonials').select('id', { count: 'exact', head: true }),
    supabase.from('invoices').select('id', { count: 'exact', head: true }),
  ]);

  return {
    products: products.count || 0,
    inquiries: inquiries.count || 0,
    newInquiries: newInquiries.count || 0,
    orders: orders.count || 0,
    pendingOrders: pendingOrders.count || 0,
    blogPosts: blogPosts.count || 0,
    services: services.count || 0,
    partners: partners.count || 0,
    testimonials: testimonials.count || 0,
    invoices: invoices.count || 0,
  };
};

export const getOrderStatusBreakdown = async (): Promise<OrderStatusBreakdown> => {
  const [pending, confirmed, delivered, cancelled] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
  ]);

  return {
    pending: pending.count || 0,
    confirmed: confirmed.count || 0,
    delivered: delivered.count || 0,
    cancelled: cancelled.count || 0,
  };
};

export const getInquiryStatusBreakdown = async (): Promise<InquiryStatusBreakdown> => {
  const [newCount, contacted, closed] = await Promise.all([
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'contacted'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'closed'),
  ]);

  return {
    new: newCount.count || 0,
    contacted: contacted.count || 0,
    closed: closed.count || 0,
  };
};

export const getFaqs = async (): Promise<FAQ[]> => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []) as FAQ[];
};
