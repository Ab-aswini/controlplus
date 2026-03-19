import { supabase } from '../lib/supabase';

export interface InvoiceItem {
  name: string;
  description?: string;
  qty: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_method: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const generateInvoiceNumber = async (prefix: string, nextNumber: number): Promise<string> => {
  const year = new Date().getFullYear();
  const paddedNum = String(nextNumber).padStart(4, '0');
  return `${prefix}-${year}-${paddedNum}`;
};

export const getInvoiceByOrderId = async (orderId: string): Promise<Invoice | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getNextInvoiceNumber = async (prefix: string): Promise<string> => {
  const year = new Date().getFullYear();
  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}-${year}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1);
  
  let nextNum = 1;
  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].invoice_number.split('-').pop() || '0');
    nextNum = lastNum + 1;
  }
  return `${prefix}-${year}-${String(nextNum).padStart(4, '0')}`;
};

export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
  const { updated_at, ...fields } = invoice as any;
  const { data, error } = await supabase
    .from('invoices')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteInvoice = async (id: string) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Payment tracking
export const updatePaymentStatus = async (id: string, status: 'unpaid' | 'partial' | 'paid', paidAmount?: number) => {
  const updates: any = { payment_status: status, updated_at: new Date().toISOString() };
  if (paidAmount !== undefined) updates.paid_amount = paidAmount;
  if (status === 'paid') updates.paid_date = new Date().toISOString();
  const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
}

export const recordPayment = async (payment: Omit<PaymentRecord, 'id' | 'created_at' | 'recorded_by'>): Promise<PaymentRecord> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('payment_history')
    .insert({ ...payment, recorded_by: user?.id || null })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getPaymentHistory = async (invoiceId: string): Promise<PaymentRecord[]> => {
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

