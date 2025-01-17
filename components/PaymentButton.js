import { useState } from 'react';
import { initializeRazorpay } from '../utils/payment';

export default function PaymentButton({ amount }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await response.json();
      
      // Initialize Razorpay
      await initializeRazorpay(orderData);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
} 