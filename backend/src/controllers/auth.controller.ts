import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(user, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (authError) {
      logger.error(`Auth signup error: ${JSON.stringify(authError)}`);
      res.status(500).json({ error: authError.message });
      return;
    }

    const userId = authData.user?.id || uuidv4();

    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert({ id: userId, email, name, role: 'patient' })
      .select()
      .single();

    if (dbError) {
      logger.error(`DB insert error: ${JSON.stringify(dbError)}`);
      res.status(500).json({ error: dbError.message });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    logger.error(`Register error: ${error}`);
    res.status(500).json({ error: `Registration failed: ${error}` });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt: ${email}`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    logger.info(`Auth response: error=${JSON.stringify(authError)} user=${authData?.user?.id}`);

    if (authError || !authData.user) {
      res.status(401).json({ error: authError?.message || 'Invalid credentials' });
      return;
    }

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url')
      .eq('email', email)
      .maybeSingle();

    logger.info(`DB response: error=${JSON.stringify(dbError)} user=${JSON.stringify(user)}`);

    if (dbError || !user) {
      logger.info(`User not in DB, inserting...`);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || email.split('@')[0],
          role: 'patient'
        })
        .select()
        .single();

      if (insertError || !newUser) {
        logger.error(`Insert error: ${JSON.stringify(insertError)}`);
        res.status(500).json({ error: `Failed to create profile: ${insertError?.message}` });
        return;
      }

      const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
      res.json({
        message: 'Login successful',
        token,
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url },
    });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    res.status(500).json({ error: `Login failed: ${error}` });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error(`Get profile error: ${error}`);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};