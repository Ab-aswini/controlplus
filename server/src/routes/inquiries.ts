import { Router, Request, Response } from 'express';
import { getDB } from '../utils/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/inquiries - public
router.post('/', (req: Request, res: Response) => {
  const { name, phone, email, product_id, message, source } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const db = getDB();
  const result = db.prepare(
    'INSERT INTO inquiries (name, phone, email, product_id, message, source) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, phone, email || null, product_id || null, message || null, source || 'contact_form');

  res.status(201).json({ id: result.lastInsertRowid, message: 'Inquiry submitted successfully' });
});

// GET /api/inquiries - authenticated
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDB();
  const { status } = req.query;

  let query = `
    SELECT i.*, p.name as product_name
    FROM inquiries i
    LEFT JOIN products p ON i.product_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) { query += ' AND i.status = ?'; params.push(status); }
  query += ' ORDER BY i.created_at DESC';

  const inquiries = db.prepare(query).all(...params);
  res.json(inquiries);
});

// PUT /api/inquiries/:id/status - authenticated
router.put('/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!status || !['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be: new, contacted, or closed' });
  }

  const db = getDB();
  const result = db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Inquiry not found' });
  res.json({ message: 'Status updated' });
});

// DELETE /api/inquiries/:id - authenticated
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Inquiry not found' });
  res.json({ message: 'Inquiry deleted' });
});

export default router;
