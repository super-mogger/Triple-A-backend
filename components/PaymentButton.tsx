import { useState } from 'react';
import { initializeRazorpay } from '../utils/payment';

const API_BASE_URL = 'https://triple-a-backend-2.vercel.app/api';

interface PaymentButtonProps {
  amount: number;
}

export default function PaymentButton({ amount }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR'
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await response.json();
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