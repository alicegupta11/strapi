// This is a placeholder - Strapi serverless implementation requires
// complex setup that may not work well with Vercel's serverless model.
// For production, consider using Railway, Render, or DigitalOcean App Platform.

module.exports = async (req, res) => {
  res.status(200).json({
    message: 'Strapi is running on local development',
    note: 'For production deployment, consider using Railway, Render, or DigitalOcean instead of Vercel',
    localUrl: 'http://localhost:1337',
    reason: 'Strapi v5 is designed for continuous Node.js servers, not serverless functions'
  });
};
