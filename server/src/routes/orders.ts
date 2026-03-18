import { Router, Request, Response } from 'express';
import { getDB } from '../utils/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/orders - authenticated
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDB();
  const { status } = req.query;

  let query = `
    SELECT o.*, p.name as linked_product_name
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) { query += ' AND o.status = ?'; params.push(status); }
  query += ' ORDER BY o.created_at DESC';

  const orders = db.prepare(query).all(...params);
  res.json(orders);
});

// POST /api/orders - authenticated
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { customer_name, customer_phone, product_id, product_name, quantity, total_amount, notes } = req.body;

  if (!customer_name) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  const db = getDB();
  const result = db.prepare(
    'INSERT INTO orders (customer_name, customer_phone, product_id, product_name, quantity, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(customer_name, customer_phone || null, product_id || null, product_name || null, quantity || 1, total_amount || null, notes || null);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Order created successfully' });
});

// PUT /api/orders/:id - authenticated
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { customer_name, customer_phone, product_id, product_name, quantity, total_amount, status, notes } = req.body;
  const db = getDB();

  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  db.prepare(`
    UPDATE orders SET customer_name=?, customer_phone=?, product_id=?, product_name=?, quantity=?, total_amount=?, status=?, notes=?
    WHERE id=?
  `).run(
    customer_name || existing.customer_name,
    customer_phone !== undefined ? customer_phone : existing.customer_phone,
    product_id !== undefined ? product_id : existing.product_id,
    product_name !== undefined ? product_name : existing.product_name,
    quantity || existing.quantity,
    total_amount !== undefined ? total_amount : existing.total_amount,
    status || existing.status,
    notes !== undefined ? notes : existing.notes,
    req.params.id
  );

  res.json({ message: 'Order updated' });
});

// PUT /api/orders/:id/status - authenticated
router.put('/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!status || !['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = getDB();
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ message: 'Status updated' });
});

// DELETE /api/orders/:id - admin only
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ message: 'Order deleted' });
});

export default router;
