const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://triple-a-fc.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Vercel serverless function handler
if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => {
    console.log('Server running on port 3001');
  });
}

module.exports = app; 