import { Router, Response } from 'express';
import { getDB } from '../utils/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/stats - authenticated
router.get('/', authenticateToken, (_req: AuthRequest, res: Response) => {
  const db = getDB();

  const products = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
  const inquiries = (db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as any).count;
  const newInquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").get() as any).count;
  const orders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
  const pendingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as any).count;
  const blogPosts = (db.prepare('SELECT COUNT(*) as count FROM blog').get() as any).count;

  res.json({ products, inquiries, newInquiries, orders, pendingOrders, blogPosts });
});

export default router;
