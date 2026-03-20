-- ============================================================================
-- ControlPlus — Complete Database Setup for Supabase
-- ============================================================================
-- HOW TO USE:
--   1. Create a new Supabase project at https://supabase.com
--   2. Go to SQL Editor (left sidebar)
--   3. Paste this ENTIRE file and click "Run"
--   4. Then go to Storage (left sidebar) and create the buckets listed at the bottom
--   5. Update the .env / environment variables with your new project's URL and anon key
-- ============================================================================

-- ##########################################################################
-- SECTION 1: TABLES
-- ##########################################################################

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('software', 'hardware')),
  category TEXT,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2),
  condition TEXT CHECK (condition IN ('new', 'refurbished')),
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'limited')),
  warranty_info TEXT,
  specs JSONB DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Inquiries (contact form submissions + product inquiries)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Follow-ups (linked to inquiries for CRM tracking)
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'note' CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'note')),
  summary TEXT NOT NULL,
  next_follow_up TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  notes TEXT,
  invoice_id UUID, -- Will be linked to invoices table after creation
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Order Items (line items for multi-product orders)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,
  items JSONB DEFAULT '[]',   -- Array of {name, description, qty, price, total}
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 18,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_date TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  payment_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from orders.invoice_id to invoices.id (deferred to avoid circular dependency)
ALTER TABLE orders ADD CONSTRAINT fk_orders_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- 9. Payment History (tracks individual payments against invoices)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT,
  reference TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Blog
CREATE TABLE IF NOT EXISTS blog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  author TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Services
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'software' CHECK (type IN ('software', 'hardware', 'support')),
  features JSONB DEFAULT '[]', -- Array of strings
  product_link TEXT,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Partners & Clients (used in logo sliders)
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT 'technology' CHECK (type IN ('technology', 'client')),
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Testimonials (client reviews)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  company TEXT DEFAULT '',
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Site Settings (key-value store for admin-configurable settings)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ##########################################################################
-- SECTION 2: ROW LEVEL SECURITY (RLS)
-- ##########################################################################

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "New users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- PRODUCTS (public read, authenticated write) ----
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Auth users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- ---- PRODUCT IMAGES (public read, authenticated write) ----
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Auth users can manage images" ON product_images FOR ALL USING (auth.role() = 'authenticated');

-- ---- INQUIRIES (public insert, authenticated read/update) ----
CREATE POLICY "Anyone can submit inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can view inquiries" ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update inquiries" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete inquiries" ON inquiries FOR DELETE USING (auth.role() = 'authenticated');

-- ---- FOLLOW UPS (authenticated only) ----
CREATE POLICY "Auth users can manage follow_ups" ON follow_ups FOR ALL USING (auth.role() = 'authenticated');

-- ---- ORDERS (authenticated only) ----
CREATE POLICY "Auth users can view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true); -- Public cart checkout
CREATE POLICY "Auth users can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- ---- ORDER ITEMS (public insert for cart, authenticated read) ----
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can manage order items" ON order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update order items" ON order_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete order items" ON order_items FOR DELETE USING (auth.role() = 'authenticated');

-- ---- INVOICES (authenticated only) ----
CREATE POLICY "Auth users can manage invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated');

-- ---- PAYMENT HISTORY (authenticated only) ----
CREATE POLICY "Auth users can manage payments" ON payment_history FOR ALL USING (auth.role() = 'authenticated');

-- ---- BLOG (public read published, authenticated full) ----
CREATE POLICY "Anyone can view published blog posts" ON blog FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Auth users can insert blog posts" ON blog FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update blog posts" ON blog FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can delete blog posts" ON blog FOR DELETE USING (auth.role() = 'authenticated');

-- ---- FAQS (public read, authenticated write) ----
CREATE POLICY "Anyone can view FAQs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Auth users can manage FAQs" ON faqs FOR ALL USING (auth.role() = 'authenticated');

-- ---- SERVICES (public read published, authenticated full) ----
CREATE POLICY "Anyone can view published services" ON services FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Auth users can manage services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- ---- PARTNERS (public read, authenticated write) ----
CREATE POLICY "Anyone can view partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Auth users can manage partners" ON partners FOR ALL USING (auth.role() = 'authenticated');

-- ---- TESTIMONIALS (public read published, authenticated full) ----
CREATE POLICY "Anyone can view published testimonials" ON testimonials FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Auth users can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- ---- SITE SETTINGS (public read, authenticated write) ----
CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Auth users can manage settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');


-- ##########################################################################
-- SECTION 3: FUNCTIONS & TRIGGERS
-- ##########################################################################

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER blog_updated_at BEFORE UPDATE ON blog FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ##########################################################################
-- SECTION 4: INDEXES (performance)
-- ##########################################################################

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_follow_ups_inquiry ON follow_ups(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(published) WHERE published = true;


-- ##########################################################################
-- SECTION 5: DEFAULT SITE SETTINGS
-- ##########################################################################

INSERT INTO site_settings (key, value) VALUES
  ('order_channels', '{"email": true, "whatsapp": true, "inquiry_form": true, "online_payment": false}'::jsonb),
  ('contact_info', '{"email": "controlplus.2020@gmail.com", "phone": "+91 96587 91783", "whatsapp": "919658791783", "address": "Controlplus (Gyanodaya Academy), Koshal Nagar Road, Balangir, Odisha 767002"}'::jsonb),
  ('invoice_settings', '{"company_name": "ControlPlus", "gstin": "", "tax_rate": 18, "prefix": "INV", "next_number": 1}'::jsonb),
  ('payment_gateway', '{"provider": "razorpay", "key_id": "", "enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ##########################################################################
-- SECTION 6: SEED DATA (optional — remove if migrating existing data)
-- ##########################################################################

-- Seed FAQs
INSERT INTO faqs (question, answer, sort_order) VALUES
('What types of software do you offer?', 'We offer GST-compliant billing software, inventory management systems, POS solutions, CRM tools, and accounting software - all designed for Indian businesses.', 1),
('Do you sell refurbished laptops?', 'Yes! All our refurbished laptops undergo thorough testing, component checks, and come with fresh OS installation and minimum 6-month warranty.', 2),
('Is installation included?', 'Absolutely. Free installation, setup, and basic training is included with every software purchase. We also offer ongoing support plans.', 3),
('What payment methods do you accept?', 'We accept UPI, bank transfer, credit/debit cards, and EMI options on select products. Cash payments also accepted at our office.', 4),
('Do you provide after-sales support?', 'Yes, every product comes with dedicated support. Software includes 1 year free support, and hardware comes with warranty-based support.', 5),
('Can I get a demo before purchasing?', 'Of course! Contact us to schedule a free demo of any software product. We can do this remotely or at your location.', 6);

-- Seed Software Products
INSERT INTO products (name, slug, type, category, description, short_description, price, stock_status, warranty_info, specs, featured) VALUES
('Billing Master Pro', 'billing-master-pro', 'software', 'billing', 'Complete GST-compliant billing software with barcode scanning, receipt printing, and detailed sales analytics. Perfect for retail shops, medical stores, and general businesses.', 'GST billing with barcode & receipt printing', 4999, 'in_stock', '1 Year Free Updates & Support', '{"Platform": "Windows 10/11", "License": "Single PC", "Database": "Local + Cloud Backup", "GST": "Auto-calculation", "Barcode": "Scanner Support"}', true),
('Inventory Manager', 'inventory-manager', 'software', 'inventory', 'Real-time inventory tracking with low-stock alerts, purchase order management, supplier directory, and multi-location support. Keep your stock organized effortlessly.', 'Real-time stock tracking & alerts', 3999, 'in_stock', '1 Year Free Updates', '{"Platform": "Windows/Web", "Multi-location": "Yes", "Alerts": "SMS + Email", "Reports": "50+ Templates", "Import": "Excel/CSV"}', true),
('Shop POS System', 'shop-pos-system', 'software', 'pos', 'Modern point-of-sale system with touchscreen support, offline capability, and integrated payment tracking. Works with receipt printers and barcode scanners.', 'Touchscreen POS with offline mode', 6999, 'in_stock', '1 Year Free Support', '{"Platform": "Windows/Android", "Offline": "Yes", "Hardware": "Printer + Scanner", "Payment": "Cash/UPI/Card", "Reports": "Daily/Weekly/Monthly"}', true),
('Customer CRM Lite', 'customer-crm-lite', 'software', 'crm', 'Track customer interactions, manage follow-ups, and analyze buying patterns. Perfect for service businesses and shops that value customer relationships.', 'Customer management & follow-ups', 2999, 'in_stock', '1 Year Free Updates', '{"Platform": "Web-based", "Contacts": "Unlimited", "Follow-ups": "Auto Reminders", "Analytics": "Customer Insights", "Communication": "SMS + Email"}', false),
('Accounting Express', 'accounting-express', 'software', 'accounting', 'Easy-to-use accounting software with profit/loss tracking, expense management, GST return preparation, and financial reporting.', 'Simple accounting with GST returns', 3499, 'in_stock', '1 Year Free Updates', '{"Platform": "Windows/Web", "GST Returns": "Auto-fill", "Reports": "P&L, Balance Sheet", "Multi-user": "Up to 3", "Backup": "Cloud + Local"}', false);

-- Seed Hardware Products
INSERT INTO products (name, slug, type, category, description, short_description, price, condition, stock_status, warranty_info, specs, featured) VALUES
('Dell Latitude E7470 - Refurbished', 'dell-latitude-e7470', 'hardware', 'laptop', 'Business-grade Dell Latitude with 14" display, perfect for office use. Thoroughly tested and certified with fresh Windows installation.', 'Business laptop - i5, 8GB, 256GB SSD', 18999, 'refurbished', 'in_stock', '6 Months Warranty', '{"Processor": "Intel Core i5-6300U", "RAM": "8GB DDR4", "Storage": "256GB SSD", "Display": "14 inch FHD", "OS": "Windows 11", "Battery": "4+ Hours"}', true),
('HP LaserJet Pro M404n', 'hp-laserjet-pro-m404n', 'hardware', 'printer', 'High-performance monochrome laser printer ideal for small offices. Fast printing with professional-quality output and network connectivity.', 'Mono laser printer - 40ppm, network ready', 12499, 'new', 'in_stock', '1 Year HP Warranty', '{"Type": "Monochrome Laser", "Speed": "40 ppm", "Resolution": "1200x1200 dpi", "Connectivity": "USB + Ethernet", "Duty Cycle": "80,000 pages/month"}', true),
('Honeywell Voyager 1250g', 'honeywell-voyager-1250g', 'hardware', 'pos', 'Reliable handheld barcode scanner with aggressive scanning capability. USB connection with plug-and-play setup.', 'USB barcode scanner - plug & play', 3499, 'new', 'in_stock', '1 Year Warranty', '{"Type": "Handheld Linear", "Interface": "USB", "Scan Rate": "100 scans/sec", "Decode": "1D Barcodes", "Cable": "2m USB"}', false),
('Lenovo ThinkPad T480 - Refurbished', 'lenovo-thinkpad-t480', 'hardware', 'laptop', 'Premium business laptop with excellent keyboard and build quality. Ideal for daily office work, accounting, and business management.', 'Premium business laptop - i5, 8GB, 512GB', 22999, 'refurbished', 'in_stock', '6 Months Warranty', '{"Processor": "Intel Core i5-8250U", "RAM": "8GB DDR4", "Storage": "512GB SSD", "Display": "14 inch FHD IPS", "OS": "Windows 11", "Battery": "6+ Hours"}', true),
('Epson TM-T82II Thermal Printer', 'epson-tm-t82ii', 'hardware', 'printer', 'Popular thermal receipt printer for POS systems. Fast, reliable printing with paper-saving features and multiple connectivity options.', 'Thermal receipt printer for POS', 8999, 'new', 'in_stock', '1 Year Epson Warranty', '{"Type": "Thermal Receipt", "Speed": "200mm/sec", "Paper": "80mm width", "Connectivity": "USB + Serial", "Auto-cutter": "Yes"}', false);

-- Seed Blog Posts
INSERT INTO blog (title, slug, content, excerpt, author, published) VALUES
('5 Signs Your Business Needs Billing Software', '5-signs-your-business-needs-billing-software',
'Managing bills manually? Here are clear signs it''s time to upgrade to billing software.

## 1. You''re Making Calculation Errors
Manual calculations lead to mistakes in invoices, tax computation, and customer billing. Billing software automates these calculations with 100% accuracy.

## 2. GST Compliance is a Headache
With changing GST rules, manual compliance is risky. Modern billing software auto-calculates GST, generates e-invoices, and helps with return filing.

## 3. You Can''t Track Sales History
If finding last month''s sales data means digging through paper files, you need digital records. Billing software stores everything searchable and accessible.

## 4. Customer Complaints About Wrong Bills
Repeated billing errors hurt your reputation. Automated billing eliminates human error and builds customer trust.

## 5. You''re Spending Too Much Time on Paperwork
Time spent on manual billing is time away from growing your business. Software can reduce billing time by 80%.

Ready to make the switch? Contact us for a free demo of our billing solutions.',
'Still managing bills manually? Here are 5 clear signs it''s time to upgrade to modern billing software for your business.',
'ControlPlus Team', true),

('How to Choose the Right Refurbished Laptop', 'how-to-choose-refurbished-laptop',
'Buying a refurbished laptop can save you 40-60% compared to new. Here''s what to look for.

## Check the Grade
- **Grade A**: Like new, minimal signs of use
- **Grade B**: Light scratches, fully functional
- **Grade C**: Visible wear, good for basic use

## Key Specs to Consider
- **Processor**: Minimum Intel i5 6th gen or equivalent
- **RAM**: At least 8GB for business use
- **Storage**: SSD is a must - minimum 256GB
- **Battery**: Should hold 3+ hours charge

## Warranty Matters
Always buy from sellers who offer minimum 6 months warranty. At ControlPlus, all our refurbished laptops come with 6-month comprehensive warranty.

## Where to Buy
Avoid random online sellers. Buy from trusted refurbished specialists who test every component and provide genuine warranty support.',
'A complete guide to buying refurbished laptops - what specs to look for, quality grades, and why warranty matters.',
'ControlPlus Team', true),

('Why Every Shop Needs a POS System in 2024', 'why-every-shop-needs-pos-system',
'Point of Sale systems have evolved from simple cash registers to powerful business management tools.

## Beyond Cash Registers
Modern POS systems do much more than process payments:
- Track inventory in real-time
- Generate sales reports instantly
- Manage customer data
- Handle multiple payment methods

## Benefits for Small Shops
- **Speed**: Process transactions 3x faster
- **Accuracy**: Eliminate manual entry errors
- **Insights**: Know your best-selling products
- **Compliance**: Auto-generate GST invoices

## Cost vs. Value
A basic POS setup costs less than you think. Starting from just Rs. 6,999 for software, you can transform your shop operations. The ROI typically shows within 3 months through time savings and error reduction.

## Getting Started
Start with a basic POS software and a receipt printer. You can add barcode scanners and other accessories as your business grows. Contact us for a free consultation.',
'Modern POS systems are essential for any retail business. Learn how a POS system can transform your shop operations.',
'ControlPlus Team', true);

-- Seed example services
INSERT INTO services (title, description, type, features, product_link, sort_order, published) VALUES
('GST Billing & Invoicing', 'Complete GST-compliant billing solution with e-invoice generation, barcode scanning, and detailed sales analytics.', 'software', '["GST Auto-calculation", "Barcode Scanning", "Receipt Printing", "Sales Analytics", "Multi-user Support"]'::jsonb, '/products?type=software&category=billing', 1, true),
('Inventory Management', 'Real-time stock tracking with low-stock alerts, purchase orders, and multi-location support.', 'software', '["Real-time Tracking", "Low Stock Alerts", "Purchase Orders", "Multi-location", "Excel Import"]'::jsonb, '/products?type=software&category=inventory', 2, true),
('POS Solutions', 'Modern point-of-sale systems with touchscreen support, offline capability, and integrated payment tracking.', 'software', '["Touchscreen Support", "Offline Mode", "Multiple Payment Methods", "Receipt Printing", "Daily Reports"]'::jsonb, '/products?type=software&category=pos', 3, true),
('Hardware Supply', 'Quality laptops, printers, barcode scanners, and POS hardware for your business needs.', 'hardware', '["Refurbished Laptops", "Printers & Scanners", "POS Hardware", "Networking Equipment", "Warranty Included"]'::jsonb, '/products?type=hardware', 4, true),
('Installation & Training', 'Free on-site installation, setup, and hands-on training for all software and hardware purchases.', 'support', '["On-site Setup", "Hands-on Training", "Data Migration", "Configuration", "Go-live Support"]'::jsonb, '/contact', 5, true),
('Technical Support', 'Dedicated customer support via phone, WhatsApp, and remote access for troubleshooting.', 'support', '["Phone Support", "WhatsApp Chat", "Remote Access", "24/7 Availability", "Priority Response"]'::jsonb, '/contact', 6, true);


-- ##########################################################################
-- SECTION 7: STORAGE BUCKETS
-- ##########################################################################
-- ⚠️  Run these in the Supabase Dashboard > Storage, NOT in SQL Editor:
--
--   1. Create bucket: "product-images"  (Public: YES)
--   2. Create bucket: "partner-logos"   (Public: YES)
--
-- Or run below via SQL (requires service_role):
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-logos', 'partner-logos', true) ON CONFLICT DO NOTHING;

-- Storage policies for product-images bucket
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth users upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Storage policies for partner-logos bucket
CREATE POLICY "Public read partner logos" ON storage.objects FOR SELECT USING (bucket_id = 'partner-logos');
CREATE POLICY "Auth users upload partner logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'partner-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users delete partner logos" ON storage.objects FOR DELETE USING (bucket_id = 'partner-logos' AND auth.role() = 'authenticated');


-- ##########################################################################
-- DONE! 🎉
-- ##########################################################################
-- Next steps:
--   1. Go to Authentication > Settings and enable Email sign-in
--   2. Create your first admin user via the Supabase Dashboard or Auth UI
--   3. Update the user's profile role to 'admin' in the profiles table
--   4. Update your .env with the new Supabase URL and Anon Key
-- ##########################################################################
