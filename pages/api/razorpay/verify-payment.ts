import type { NextApiRequest, NextApiResponse } from 'next';
import cors from 'cors';
import crypto from 'crypto';
import { logger } from '../../../utils/logger';

const corsMiddleware = cors({
  origin: [
    'http://localhost:3000',
    'https://triple-a-fc.vercel.app'
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

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
    await runMiddleware(req, res, corsMiddleware);

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      logger.info('Payment verified successfully', { payment_id: razorpay_payment_id });
      return res.status(200).json({
        status: 'success',
        payment_id: razorpay_payment_id
      });
    } else {
      logger.error('Payment signature verification failed');
      return res.status(400).json({
        status: 'failure',
        message: 'Invalid signature'
      });
    }
  } catch (error) {
    logger.error('Error in verify-payment', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 