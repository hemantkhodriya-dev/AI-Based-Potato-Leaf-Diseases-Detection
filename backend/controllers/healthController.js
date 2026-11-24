const axios = require('axios');
const mongoose = require('mongoose');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const getHealth = async (req, res) => {
  let aiHealth = { status: 'down', message: 'AI Service unreachable' };
  try {
    const aiRes = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
    aiHealth = aiRes.data;
  } catch (err) {
    aiHealth = { status: 'offline', error: err.message };
  }

  const isMongoConnected = mongoose.connection.readyState === 1;

  res.json({
    status: 'ok',
    service: 'PotatoCare Backend API',
    database: isMongoConnected ? 'MongoDB' : 'Memory Storage Fallback',
    aiServiceUrl: AI_SERVICE_URL,
    aiServiceStatus: aiHealth,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
