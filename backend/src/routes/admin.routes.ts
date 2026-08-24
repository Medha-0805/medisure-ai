import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

// Dashboard stats
router.get('/stats', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: medicinesCount } = await supabase.from('medicines').select('*', { count: 'exact', head: true });
    const { count: prescriptionsCount } = await supabase.from('prescriptions').select('*', { count: 'exact', head: true });
    const { count: remindersCount } = await supabase.from('reminders').select('*', { count: 'exact', head: true });
    const { count: verificationsCount } = await supabase.from('verification_logs').select('*', { count: 'exact', head: true });

    res.json({
      totalUsers: usersCount ?? 0,
      totalMedicines: medicinesCount ?? 0,
      totalPrescriptions: prescriptionsCount ?? 0,
      totalReminders: remindersCount ?? 0,
      totalVerifications: verificationsCount ?? 0,
    });
  } catch (error) {
    logger.error(`Admin stats error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// All users
router.get('/users', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, phone, blood_group, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ users: data || [] });
  } catch (error) {
    logger.error(`Admin get users error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role / status
router.put('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (error) {
    logger.error(`Admin update user error: ${error}`);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Recent prescriptions (all users)
router.get('/prescriptions', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('id, user_id, status, doctor_name, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ prescriptions: data || [] });
  } catch (error) {
    logger.error(`Admin get prescriptions error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Recent verification logs
router.get('/verifications', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { data, error } = await supabase
      .from('verification_logs')
      .select('id, user_id, medicine_id, result, scanned_at')
      .order('scanned_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ verifications: data || [] });
  } catch (error) {
    logger.error(`Admin get verifications error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

export default router;