import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import medicineRoutes from './routes/medicine.routes';
import prescriptionRoutes from './routes/prescription.routes';
import reminderRoutes from './routes/reminder.routes';
import interactionRoutes from './routes/interaction.routes';
import qrRoutes from './routes/qr.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import emergencyRoutes from './routes/emergency.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'MediSure AI Backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('SIGINT', () => {
  logger.info('Server shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

const server = app.listen(PORT, () => {
  logger.info(`MediSure AI Backend running on port ${PORT}`);
});

server.on('error', (err) => {
  logger.error(`Server error: ${err}`);
});

export default app;