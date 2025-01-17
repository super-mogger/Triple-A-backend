import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';
import cors from 'cors';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_GEZQfBnCrf1uyR',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Z0GdpsZJIu2kRgp2cboJiBjM'
});

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'https://triple-a-fitness.vercel.app'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

// Wrapper for CORS middleware
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
  // Run CORS middleware
  await runMiddleware(req, res, corsMiddleware);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR' } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount), // amount in paise
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };

    console.log('Creating order with options:', { ...options, amount: options.amount / 100 });

    const order = await razorpay.orders.create(options);
    console.log('Order created:', order);

    res.status(200).json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 