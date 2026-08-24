import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => res.json({ message: 'QR routes coming soon' }));
export default router;