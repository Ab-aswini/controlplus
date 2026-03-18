import { Router, Request, Response } from 'express';
import { getDB } from '../utils/database';

const router = Router();

// GET /api/faqs - public
router.get('/', (_req: Request, res: Response) => {
  const db = getDB();
  const faqs = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all();
  res.json(faqs);
});

export default router;
