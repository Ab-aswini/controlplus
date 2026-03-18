import { Router, Request, Response } from 'express';
import { getDB } from '../utils/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/blog - public (published only) or all (authenticated)
router.get('/', (req: Request, res: Response) => {
  const db = getDB();
  const { published } = req.query;

  let query = 'SELECT * FROM blog';
  if (published === 'true' || !req.headers['authorization']) {
    query += ' WHERE published = 1';
  }
  query += ' ORDER BY created_at DESC';

  const posts = db.prepare(query).all();
  res.json(posts);
});

// GET /api/blog/:slug - public
router.get('/:slug', (req: Request, res: Response) => {
  const db = getDB();
  const post = db.prepare('SELECT * FROM blog WHERE slug = ?').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// POST /api/blog - authenticated
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, content, excerpt, published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const db = getDB();

  try {
    const result = db.prepare(
      'INSERT INTO blog (title, slug, content, excerpt, author, published) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, slug, content, excerpt || null, req.user?.name || 'Admin', published ? 1 : 0);

    res.status(201).json({ id: result.lastInsertRowid, slug });
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Post with similar title already exists' });
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/blog/:id - authenticated
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, content, excerpt, published } = req.body;
  const db = getDB();

  const existing = db.prepare('SELECT * FROM blog WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Post not found' });

  const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : existing.slug;

  db.prepare(`
    UPDATE blog SET title=?, slug=?, content=?, excerpt=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(
    title || existing.title,
    slug,
    content || existing.content,
    excerpt !== undefined ? excerpt : existing.excerpt,
    published !== undefined ? (published ? 1 : 0) : existing.published,
    req.params.id
  );

  res.json({ message: 'Post updated', slug });
});

// DELETE /api/blog/:id - admin only
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM blog WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Post not found' });
  res.json({ message: 'Post deleted' });
});

export default router;
