import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';
import cors from 'cors';

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

// Request logging
const logRequest = (req: NextApiRequest) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
};

// Main handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log request
  logRequest(req);

  // Apply CORS
  await runMiddleware(req, res, corsMiddleware);

  // Method validation
  if (req.method !== 'POST') {
    console.log(`Method ${req.method} not allowed`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR' } = req.body;

    // Input validation
    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };

    // Create order
    console.log('Creating order with options:', options);
    const order = await razorpay.orders.create(options);
    
    // Log successful order
    console.log('Order created successfully:', order.id);

    // Send response
    res.status(200).json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    // Error logging
    console.error('Error creating order:', error);
    
    res.status(500).json({ 
      message: 'Error creating order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Payment verification endpoint
export async function verifyPayment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  logRequest(req);
  await runMiddleware(req, res, corsMiddleware);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create signature verification data
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log('Payment verified successfully:', razorpay_payment_id);
      res.json({ status: 'success', payment_id: razorpay_payment_id });
    } else {
      console.log('Payment verification failed');
      res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 