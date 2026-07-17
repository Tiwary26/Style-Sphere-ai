const express = require('express');
const cors = require('cors');
const path = require('path');

// Route imports
const authRoutes = require('./routes/authRoutes');
const clothesRoutes = require('./routes/clothesRoutes');
const outfitsRoutes = require('./routes/outfitsRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const laundryRoutes = require('./routes/laundryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const travelRoutes = require('./routes/travelRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const communityRoutes = require('./routes/communityRoutes');
const adminRoutes = require('./routes/adminRoutes');

const mongoose = require('mongoose');

const app = express();

// Apply Global Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection validation middleware
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please verify that your MongoDB service is running, or set up your MongoDB Atlas connection string in the server\'s .env file.',
    });
  }
  next();
});

// Serve static uploaded files (dual-mode local storage support)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clothes', clothesRoutes);
app.use('/api/outfits', outfitsRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

// Base route for connectivity check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the StyleSphere AI API Engine.' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
