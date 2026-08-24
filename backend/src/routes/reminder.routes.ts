import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

// Get all reminders for user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ reminders: data });
  } catch (error) {
    logger.error(`Get reminders error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create reminder
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { medicine_name, dosage, frequency, times, start_date, end_date, notes } = req.body;

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: req.user!.id,
        medicine_name,
        dosage,
        frequency,
        times,
        start_date,
        end_date: end_date || null,
        notes,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ reminder: data });
  } catch (error) {
    logger.error(`Create reminder error: ${error}`);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('reminders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ reminder: data });
  } catch (error) {
    logger.error(`Update reminder error: ${error}`);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) throw error;
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    logger.error(`Delete reminder error: ${error}`);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;