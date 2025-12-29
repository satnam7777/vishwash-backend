require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cookieParser());
app.use(express.json());

// ----------------------------
// ✅ CORS Setup
// ----------------------------
const allowedOrigins = [
  'http://localhost:3000',                 // Local dev
  'https://vishwash-frontend.vercel.app'  // Vercel frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ----------------------------
// ✅ Routes
// ----------------------------
app.use('/api/auth', authRoutes);         // /api/auth/login, /api/auth/register, etc.
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ----------------------------
// ✅ MongoDB Connection
// ----------------------------
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard')
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// ----------------------------
// ✅ Global Error Handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message || err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});
