import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ prescriptions: data || [] });
  } catch (error) {
    logger.error(`Get prescriptions error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

export default router;