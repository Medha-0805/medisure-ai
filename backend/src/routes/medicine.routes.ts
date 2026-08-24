import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query required' });
      return;
    }

    const { data, error } = await supabase
      .from('medicines')
      .select('id, name, composition, uses, side_effects, manufacturer, image_url, excellent_review, average_review, poor_review')
      .ilike('name', `%${q}%`)
      .limit(20);

    if (error) throw error;

    res.json({ medicines: data || [], total: data?.length || 0 });
  } catch (error) {
    logger.error(`Medicine search error: ${error}`);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }

    res.json({ medicine: data });
  } catch (error) {
    logger.error(`Get medicine error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

export default router;