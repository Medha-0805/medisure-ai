import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import axios from 'axios';

const router = Router();

router.post('/message', authenticate, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const GROQ_KEY = process.env.GROQ_API_KEY;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are MediSure AI, an intelligent healthcare assistant. Help users with medicine information, dosage guidance, side effects, drug interactions, and general health awareness. Always recommend consulting a doctor for serious conditions. Keep responses concise and easy to understand. End with a brief disclaimer.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ success: true, response: aiResponse });
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message;
    res.status(500).json({ error: errMsg });
  }
});

export default router;