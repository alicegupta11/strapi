const { createServer } = require('@strapi/strapi');
const server = require('./index');

module.exports = async (req, res) => {
  // Ensure Strapi instance exists and is ready
  if (!server.app) {
    await server.init();
  }

  // Handle serverless requests
  return new Promise((resolve, reject) => {
    server.app(req, res, (err) => {
      if (err) {
        reject(err);
      return;
      }
      resolve();
    });
  });
};
