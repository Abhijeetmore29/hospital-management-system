const dotenv = require('dotenv');

function loadEnv() {
  dotenv.config();

  return {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}

module.exports = { loadEnv };

