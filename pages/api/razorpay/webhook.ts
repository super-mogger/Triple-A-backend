import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      throw new Error('No signature found in request');
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Handle different webhook events
    const event = req.body;
    console.log('Received webhook event:', event);

    switch (event.event) {
      case 'payment.authorized':
        // Payment was authorized but not captured yet
        console.log('Payment authorized:', event.payload.payment.entity);
        break;

      case 'payment.captured':
        // Payment was successfully captured
        console.log('Payment captured:', event.payload.payment.entity);
        // Update user's membership status here
        break;

      case 'payment.failed':
        // Payment failed
        console.log('Payment failed:', event.payload.payment.entity);
        break;

      default:
        console.log('Unhandled event type:', event.event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      message: 'Webhook processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 