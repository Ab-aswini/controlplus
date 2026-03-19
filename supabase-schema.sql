-- ControlPlus Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- 1. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products
CREATE TABLE products (
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
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Inquiries
CREATE TABLE inquiries (
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

-- 5. Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Blog
CREATE TABLE blog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. FAQs
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- PROFILES
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

-- PRODUCTS (public read, authenticated write)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- PRODUCT IMAGES (public read, authenticated write)
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage images" ON product_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update images" ON product_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete images" ON product_images FOR DELETE USING (auth.role() = 'authenticated');

-- INQUIRIES (public insert, authenticated read/update)
CREATE POLICY "Anyone can submit inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view inquiries" ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update inquiries" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete inquiries" ON inquiries FOR DELETE USING (auth.role() = 'authenticated');

-- ORDERS (authenticated only)
CREATE POLICY "Authenticated users can view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- BLOG (public read published, authenticated full access)
CREATE POLICY "Anyone can view published blog posts" ON blog FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert blog posts" ON blog FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update blog posts" ON blog FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete blog posts" ON blog FOR DELETE USING (auth.role() = 'authenticated');

-- FAQS (public read, authenticated write)
CREATE POLICY "Anyone can view FAQs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage FAQs" ON faqs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update FAQs" ON faqs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete FAQs" ON faqs FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGERS
-- ============================================

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

-- Auto-update updated_at on products
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blog_updated_at
  BEFORE UPDATE ON blog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create product images bucket (run in Supabase dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- ============================================
-- SEED DATA
-- ============================================

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
