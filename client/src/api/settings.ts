import { supabase } from '../lib/supabase';

export interface OrderChannels {
  email: boolean;
  whatsapp: boolean;
  inquiry_form: boolean;
  online_payment: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export interface InvoiceSettings {
  company_name: string;
  gstin: string;
  tax_rate: number;
  prefix: string;
  next_number: number;
}

export interface PaymentGateway {
  provider: string;
  key_id: string;
  enabled: boolean;
}

export interface SiteSettings {
  order_channels: OrderChannels;
  contact_info: ContactInfo;
  invoice_settings: InvoiceSettings;
  payment_gateway: PaymentGateway;
}

const DEFAULTS: SiteSettings = {
  order_channels: { email: true, whatsapp: true, inquiry_form: true, online_payment: false },
  contact_info: { email: 'controlplus.2020@gmail.com', phone: '+91 96587 91783', whatsapp: '919658791783', address: 'Controlplus (Gyanodaya Academy), Koshal Nagar Road, Balangir, Odisha 767002' },
  invoice_settings: { company_name: 'ControlPlus', gstin: '', tax_rate: 18, prefix: 'INV', next_number: 1 },
  payment_gateway: { provider: 'razorpay', key_id: '', enabled: false },
};

export const getAllSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) throw error;

  const settings = { ...DEFAULTS };
  for (const row of data || []) {
    if (row.key in settings) {
      (settings as any)[row.key] = row.value;
    }
  }
  return settings;
};

export const getSetting = async <K extends keyof SiteSettings>(key: K): Promise<SiteSettings[K]> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) return DEFAULTS[key];
  return data.value as SiteSettings[K];
};

export const updateSetting = async <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key, value: value as any, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) throw error;
};

// Helper: get effective channels for a product (product override or global)
export const getProductChannels = (
  productChannels: OrderChannels | null,
  globalChannels: OrderChannels
): OrderChannels => {
  if (productChannels) return productChannels;
  return globalChannels;
};
