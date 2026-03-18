export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  type: 'software' | 'hardware';
  description: string | null;
  short_description: string | null;
  price: number | null;
  condition: 'new' | 'refurbished' | null;
  stock_status: 'in_stock' | 'out_of_stock';
  warranty_info: string | null;
  specs: Record<string, string> | null;
  featured: number;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: number;
}

export interface Inquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  product_id: number | null;
  product_name?: string;
  message: string | null;
  source: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string | null;
  product_id: number | null;
  product_name: string | null;
  quantity: number;
  total_amount: number | null;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
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
