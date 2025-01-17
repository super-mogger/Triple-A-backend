export const initializeRazorpay = async (orderData) => {
  const options = {
    key: "rzp_test_GEZQfBnCrf1uyR", // Enter the Key ID from README
    amount: orderData.amount,
    currency: orderData.currency,
    name: "Triple A FC",
    description: "Fitness Program Payment",
    order_id: orderData.id,
    handler: async function (response) {
      try {
        const verificationResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const data = await verificationResponse.json();
        
        if (data.status === 'success') {
          // Payment successful - update UI accordingly
          alert('Payment successful!');
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

  const rzp1 = new window.Razorpay(options);
  rzp1.open();
}; 