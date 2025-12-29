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
  'http://localhost:3000',
  'https://vishwash-frontend.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow non-browser requests
    if (!origin) return callback(null, true);

    // allow localhost & prod
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow ALL Vercel preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // DO NOT THROW ERROR (very important)
    return callback(null, false);
  },
  credentials: true,
}));

app.options('*', cors());

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
