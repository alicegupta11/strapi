import path from 'path';

export default {
  register({ strapi }) {
    // Serve the registration page
    strapi.server.router.use(async (ctx, next) => {
      if (ctx.path === '/registration') {
        try {
          const fs = require('fs');
          const registrationPath = path.join(__dirname, '..', 'public', 'registration.html');
          const fileContent = fs.readFileSync(registrationPath, 'utf8');
          ctx.type = 'text/html';
          ctx.body = fileContent;
          return;
        } catch (error) {
          strapi.log.error('Error serving registration page:', error);
          ctx.status = 404;
          ctx.body = 'Registration page not found';
          return;
        }
      }
      await next();
    });
  },

  bootstrap({ strapi }) {
    // Bootstrap code
  },
};
