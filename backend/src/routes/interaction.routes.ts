import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => res.json({ message: 'Interaction routes coming soon' }));
export default router;