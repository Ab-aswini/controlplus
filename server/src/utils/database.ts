import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(__dirname, '../../data.db');
let db: Database.Database;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDB(): void {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('admin', 'staff')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('software', 'hardware')),
      description TEXT,
      short_description TEXT,
      price REAL,
      condition TEXT CHECK(condition IN ('new', 'refurbished', NULL)),
      stock_status TEXT DEFAULT 'in_stock' CHECK(stock_status IN ('in_stock', 'out_of_stock')),
      warranty_info TEXT,
      specs TEXT,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      product_id INTEGER,
      message TEXT,
      source TEXT DEFAULT 'contact_form',
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      product_id INTEGER,
      product_name TEXT,
      quantity INTEGER DEFAULT 1,
      total_amount REAL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS blog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      author TEXT DEFAULT 'Admin',
      published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin user if not exists
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@controlplus.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@controlplus.com', hashedPassword, 'admin');
    console.log('🔑 Default admin created: admin@controlplus.com / admin123');
  }

  // Seed sample data
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
  if (productCount.count === 0) {
    seedSampleData(db);
  }

  console.log('📦 Database initialized successfully');
}

function seedSampleData(db: Database.Database): void {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, category, type, description, short_description, price, condition, stock_status, warranty_info, specs, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Software products
  insertProduct.run('Billing Master Pro', 'billing-master-pro', 'billing', 'software',
    'Complete billing and invoicing solution for retail shops. GST compliant with barcode support, inventory tracking, and detailed sales reports. Perfect for small to medium businesses.',
    'Complete GST-compliant billing solution for retail businesses', 4999, null, 'in_stock', null,
    JSON.stringify({platform: 'Windows/Web', license: 'Lifetime', support: '1 Year Free', updates: 'Free for 1 year'}), 1);

  insertProduct.run('Inventory Manager', 'inventory-manager', 'inventory', 'software',
    'Smart inventory management system with real-time stock tracking, low-stock alerts, purchase order management, and supplier directory.',
    'Real-time stock tracking and management system', 3499, null, 'in_stock', null,
    JSON.stringify({platform: 'Web/Mobile', license: 'Annual', support: '24/7', users: 'Up to 5'}), 1);

  insertProduct.run('Shop POS System', 'shop-pos-system', 'pos', 'software',
    'Modern point-of-sale system with touchscreen support, barcode scanning, receipt printing, and daily sales summary. Works offline.',
    'Modern POS with offline support and barcode scanning', 6999, null, 'in_stock', null,
    JSON.stringify({platform: 'Windows/Android', license: 'Lifetime', devices: '2 included', backup: 'Cloud + Local'}), 1);

  insertProduct.run('Customer CRM Lite', 'customer-crm-lite', 'crm', 'software',
    'Simple yet powerful CRM designed for local businesses. Track customer interactions, set follow-up reminders, and analyze customer behavior.',
    'Simple CRM for local businesses', 2499, null, 'in_stock', null,
    JSON.stringify({platform: 'Web', license: 'Annual', contacts: 'Unlimited', reports: 'Monthly/Weekly'}), 0);

  insertProduct.run('Accounting Express', 'accounting-express', 'accounting', 'software',
    'Easy-to-use accounting software with profit/loss tracking, expense management, GST returns, and financial reports.',
    'Easy accounting with GST support', 3999, null, 'in_stock', null,
    JSON.stringify({platform: 'Windows/Web', license: 'Annual', compliance: 'GST Ready', backup: 'Auto Cloud'}), 0);

  // Hardware products
  insertProduct.run('HP ProBook 450 G8', 'hp-probook-450-g8', 'laptop', 'hardware',
    'Business-class laptop perfect for office work. 15.6" Full HD display, Intel Core i5, 8GB RAM, 256GB SSD. Pre-installed with Windows 11 Pro.',
    'Business laptop with i5 processor and SSD', 32999, 'refurbished', 'in_stock', '6 months warranty',
    JSON.stringify({processor: 'Intel Core i5-11th Gen', ram: '8GB DDR4', storage: '256GB SSD', display: '15.6" FHD', os: 'Windows 11 Pro'}), 1);

  insertProduct.run('Epson TM-T82 Thermal Printer', 'epson-tm-t82', 'printer', 'hardware',
    'High-speed thermal receipt printer for POS systems. 200mm/sec print speed, auto-cutter, USB + Serial connectivity.',
    'Fast thermal receipt printer for POS', 8999, 'new', 'in_stock', '1 year manufacturer warranty',
    JSON.stringify({speed: '200mm/sec', width: '80mm', connectivity: 'USB + Serial', cutter: 'Auto', resolution: '203 dpi'}), 1);

  insertProduct.run('Lenovo ThinkPad T480', 'lenovo-thinkpad-t480', 'laptop', 'hardware',
    'Premium refurbished business laptop. 14" FHD, Intel Core i5 8th Gen, 8GB RAM, 256GB SSD. Excellent condition with new battery.',
    'Premium refurbished ThinkPad with new battery', 24999, 'refurbished', 'in_stock', '6 months warranty',
    JSON.stringify({processor: 'Intel Core i5-8th Gen', ram: '8GB DDR4', storage: '256GB SSD', display: '14" FHD IPS', battery: 'New replacement'}), 0);

  insertProduct.run('TVS RP-3200 Star POS Printer', 'tvs-rp-3200', 'printer', 'hardware',
    'Dot matrix billing printer ideal for multi-part printing. Durable and cost-effective for high-volume billing environments.',
    'Dot matrix printer for multi-part billing', 6499, 'new', 'in_stock', '1 year warranty',
    JSON.stringify({type: 'Dot Matrix', speed: '220 CPS', columns: '76/40', connectivity: 'USB + Parallel', copies: '3-part'}), 0);

  insertProduct.run('Honeywell Barcode Scanner', 'honeywell-barcode-scanner', 'pos', 'hardware',
    'Wired USB barcode scanner with 1D/2D scanning capability. Plug and play, no driver needed. Perfect for retail and warehouse.',
    'USB barcode scanner - plug and play', 3499, 'new', 'in_stock', '1 year warranty',
    JSON.stringify({type: '1D/2D Imager', connectivity: 'USB Wired', range: '30cm', speed: '270 scans/sec', compatibility: 'All POS software'}), 0);

  // Seed FAQs
  const insertFaq = db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
  insertFaq.run('What types of software do you offer?', 'We offer billing software, inventory management, POS systems, CRM solutions, and accounting software tailored for small and medium businesses.', 1);
  insertFaq.run('Do you provide refurbished hardware?', 'Yes! We offer quality-tested refurbished laptops, printers, and POS equipment with warranty. All refurbished items go through a thorough quality check.', 2);
  insertFaq.run('Is there a warranty on refurbished products?', 'All our refurbished products come with a minimum 6-month warranty. New products carry the standard manufacturer warranty.', 3);
  insertFaq.run('Can I get a demo before purchasing software?', 'Absolutely! Contact us through the enquiry form or WhatsApp, and we will arrange a free demo for any software product.', 4);
  insertFaq.run('Do you provide installation and support?', 'Yes, we provide free installation and setup for all software products. We also offer 1 year of free technical support.', 5);
  insertFaq.run('What payment methods do you accept?', 'We accept UPI, bank transfer, cash, and card payments. For software products, we also offer monthly EMI options.', 6);

  // Seed blog posts
  const insertBlog = db.prepare('INSERT INTO blog (title, slug, content, excerpt, published) VALUES (?, ?, ?, ?, ?)');
  insertBlog.run('5 Essential Software Every Small Business Needs', 'essential-software-small-business',
    'Running a small business requires the right tools. Here are the 5 must-have software solutions:\n\n## 1. Billing & Invoicing\nA good billing software automates invoice generation, tracks payments, and ensures GST compliance.\n\n## 2. Inventory Management\nKeep track of stock levels, set reorder alerts, and manage suppliers efficiently.\n\n## 3. Customer CRM\nTrack customer interactions, manage follow-ups, and build lasting relationships.\n\n## 4. Accounting Software\nManage your books, track expenses, and generate financial reports with ease.\n\n## 5. POS System\nStreamline checkout, manage cash registers, and get real-time sales data.',
    'Discover the top 5 software solutions that every small business owner should invest in to boost efficiency.', 1);
  insertBlog.run('New vs Refurbished: Making the Smart Choice', 'new-vs-refurbished-smart-choice',
    'When it comes to business hardware, the new vs refurbished debate is common. Here is our take:\n\n## Why Refurbished?\n- **Cost Savings**: Save 40-60% compared to new\n- **Quality Tested**: Our refurbished products go through rigorous testing\n- **Warranty Included**: We back every product with warranty\n- **Eco-Friendly**: Reduce e-waste by giving products a second life\n\n## When to Buy New?\n- Mission-critical systems\n- Latest technology requirements\n- Long-term heavy usage\n\nThe smart approach? Mix both! Use refurbished for general office work and invest in new hardware for specialized tasks.',
    'Understanding when to buy new hardware vs quality refurbished equipment for your business.', 1);
  insertBlog.run('How to Choose the Right POS System', 'choose-right-pos-system',
    'Choosing a POS system is a crucial decision for any retail business. Here is what to consider:\n\n## Key Features to Look For\n- Barcode scanning support\n- Receipt printing\n- Offline capability\n- Inventory integration\n- GST-compliant billing\n\n## Hardware Requirements\n- Touch screen or keyboard-based\n- Receipt printer (thermal recommended)\n- Barcode scanner\n- Cash drawer\n\n## Budget Planning\nA complete POS setup can range from ₹15,000 to ₹50,000 depending on your needs. We can help you find the perfect setup within your budget.',
    'A complete guide to selecting the perfect POS system for your retail business.', 1);

  console.log('🌱 Sample data seeded successfully');
}
