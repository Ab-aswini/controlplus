import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../utils/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = Router();

// POST /api/upload - general image upload
router.post('/', authenticateToken, upload.single('image'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// POST /api/upload/product-image - upload and link to product
router.post('/product-image', authenticateToken, upload.single('image'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { product_id, is_primary } = req.body;
  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  const url = `/uploads/${req.file.filename}`;
  const db = getDB();

  if (is_primary === '1' || is_primary === 'true') {
    db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(product_id);
  }

  const result = db.prepare(
    'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)'
  ).run(product_id, url, is_primary === '1' || is_primary === 'true' ? 1 : 0);

  res.status(201).json({ id: result.lastInsertRowid, url });
});

export default router;
