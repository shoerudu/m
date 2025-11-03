const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

// Environment variables
const API_KEY = process.env.API_KEY || 'sk_tzIuIbEx726kD8uL';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API Routes
app.get('/api/stats', async (req, res) => {
  const { linkId } = req.query;
  
  if (!linkId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing linkId parameter' 
    });
  }

  try {
    console.log('Fetching stats for link:', linkId);
    
    const response = await axios.get(
      `https://api-v2.short.io/statistics/link/${encodeURIComponent(linkId)}`, 
      {
        params: { period: 'total' },
        headers: { 
          accept: 'application/json', 
          authorization: API_KEY 
        },
        timeout: 10000
      }
    );

    const data = response.data;
    const humanClicks = data.humanClicks || 0;

    let countries = [];
    if (data.country && Array.isArray(data.country)) {
      countries = data.country.map(c => ({
        code: c.code || '',
        name: c.name || '',
        score: c.humanScore || c.score || 0
      }));
    }

    res.json({
      success: true,
      humanClicks,
      countries,
      linkId: linkId
    });

  } catch (error) {
    console.error('API Error:', error.message);
    
    // Better error handling
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data,
        message: 'Short.io API error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend (if you have)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    availableEndpoints: ['/api/stats', '/api/health']
  });
});

// Export for Vercel serverless
module.exports = app;
