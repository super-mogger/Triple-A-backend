import PaymentButton from '../components/PaymentButton';

export default function PricingPage() {
  return (
    <div className="pricing-container">
      <div className="pricing-card">
        <h2>Basic Plan</h2>
        <p>₹999/month</p>
        <PaymentButton amount={999} />
      </div>
      {/* Add more pricing cards as needed */}
    </div>
  );
} 