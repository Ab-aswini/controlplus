export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: 'software' | 'hardware';
  description: string | null;
  short_description: string | null;
  price: number | null;
  condition: 'new' | 'refurbished' | null;
  stock_status: 'in_stock' | 'out_of_stock' | 'limited';
  warranty_info: string | null;
  specs: Record<string, string> | null;
  featured: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  product_id: string | null;
  product_name?: string;
  message: string | null;
  source: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  total_amount: number | null;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface Stats {
  products: number;
  inquiries: number;
  newInquiries: number;
  orders: number;
  pendingOrders: number;
  blogPosts: number;
}

export interface FollowUp {
  id: string;
  inquiry_id: string;
  user_id: string | null;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';
  summary: string;
  next_follow_up: string | null;
  completed: boolean;
  created_at: string;
}
