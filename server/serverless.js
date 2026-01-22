// Use the built Strapi application
const app = require('../dist/index.js');

module.exports = async (req, res) => {
  // Handle serverless requests
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        console.error('Request handler error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
        reject(err);
        return;
      }
      resolve();
    });
  });
};
