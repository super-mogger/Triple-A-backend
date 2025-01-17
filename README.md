# Triple A Backend

Backend service for Triple A Fitness app, handling Razorpay payment integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Razorpay credentials:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

3. Run locally:
```bash
npm run dev
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel:
- Go to your project settings
- Add these environment variables:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`

## API Endpoints

### Create Razorpay Order
- **URL**: `/api/razorpay/createOrder`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "amount": 1000, // amount in paise
    "currency": "INR" // optional, defaults to INR
  }
  ```
- **Response**:
  ```json
  {
    "orderId": "order_123...",
    "amount": 1000,
    "currency": "INR"
  }
  ```

## Testing

Use these test credentials for Razorpay:
- Card number: 4111 1111 1111 1111
- Any future expiry date
- Any CVV
