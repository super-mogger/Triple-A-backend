import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';
import cors from 'cors';
import { logger } from '../../../utils/logger';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CORS Configuration
const corsMiddleware = cors({
  origin: [
    'http://localhost:3000',
    'https://triple-a-fc.vercel.app'
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

// Middleware runner
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Apply CORS
    await runMiddleware(req, res, corsMiddleware);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };

    logger.info('Creating Razorpay order', options);
    const order = await razorpay.orders.create(options);
    logger.info('Order created', order);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    logger.error('Error in create-order', error);
    res.status(500).json({
      message: 'Error creating order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 