const API_BASE_URL = 'https://triple-a-backend-2.vercel.app/api';

interface OrderData {
  id: string;
  amount: number;
  currency: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const initializeRazorpay = async (orderData: OrderData) => {
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_GEZQfBnCrf1uyR',
    amount: orderData.amount,
    currency: orderData.currency,
    name: "Triple A FC",
    description: "Fitness Program Payment",
    order_id: orderData.id,
    handler: async function (response: RazorpayResponse) {
      try {
        const verificationResponse = await fetch(`${API_BASE_URL}/razorpay/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
          credentials: 'include'
        });

        const data = await verificationResponse.json();
        
        if (data.status === 'success') {
          alert('Payment successful!');
        } else {
          throw new Error(data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error(err);
        alert('Payment verification failed');
      }
    },
    prefill: {
      name: "",
      email: "",
      contact: "",
    },
    theme: {
      color: "#3399cc",
    },
  };

  const rzp1 = new (window as any).Razorpay(options);
  rzp1.open();
}; 