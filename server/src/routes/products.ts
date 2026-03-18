import { Router, Request, Response } from 'express';
import { getDB } from '../utils/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/products - public
router.get('/', (req: Request, res: Response) => {
  const db = getDB();
  const { type, category, featured, search } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (featured) { query += ' AND featured = 1'; }
  if (search) { query += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY featured DESC, created_at DESC';
  const products = db.prepare(query).all(...params);

  // Attach images
  const imgStmt = db.prepare('SELECT * FROM product_images WHERE product_id = ?');
  const result = products.map((p: any) => ({
    ...p,
    specs: p.specs ? JSON.parse(p.specs) : null,
    images: imgStmt.all(p.id)
  }));

  res.json(result);
});

// GET /api/products/:slug - public
router.get('/:slug', (req: Request, res: Response) => {
  const db = getDB();
  const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug) as any;
  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.specs = product.specs ? JSON.parse(product.specs) : null;
  product.images = db.prepare('SELECT * FROM product_images WHERE product_id = ?').all(product.id);
  res.json(product);
});

// POST /api/products - authenticated
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, category, type, description, short_description, price, condition, stock_status, warranty_info, specs, featured } = req.body;

  if (!name || !category || !type) {
    return res.status(400).json({ error: 'Name, category, and type are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const db = getDB();

  try {
    const result = db.prepare(`
      INSERT INTO products (name, slug, category, type, description, short_description, price, condition, stock_status, warranty_info, specs, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, category, type, description || null, short_description || null, price || null, condition || null, stock_status || 'in_stock', warranty_info || null, specs ? JSON.stringify(specs) : null, featured ? 1 : 0);

    res.status(201).json({ id: result.lastInsertRowid, slug });
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Product with similar name already exists' });
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - authenticated
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, category, type, description, short_description, price, condition, stock_status, warranty_info, specs, featured } = req.body;
  const db = getDB();

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : (existing as any).slug;

  db.prepare(`
    UPDATE products SET name=?, slug=?, category=?, type=?, description=?, short_description=?, price=?, condition=?, stock_status=?, warranty_info=?, specs=?, featured=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    name || (existing as any).name, slug, category || (existing as any).category, type || (existing as any).type,
    description !== undefined ? description : (existing as any).description,
    short_description !== undefined ? short_description : (existing as any).short_description,
    price !== undefined ? price : (existing as any).price,
    condition !== undefined ? condition : (existing as any).condition,
    stock_status || (existing as any).stock_status,
    warranty_info !== undefined ? warranty_info : (existing as any).warranty_info,
    specs ? JSON.stringify(specs) : (existing as any).specs,
    featured !== undefined ? (featured ? 1 : 0) : (existing as any).featured,
    req.params.id
  );

  res.json({ message: 'Product updated', slug });
});

// DELETE /api/products/:id - admin only
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

export default router;
