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

    // Handle registration confirmation
    strapi.server.router.post('/api/registration/confirm', async (ctx) => {
      // Parse JSON body manually since strapi::body doesn't apply to custom server routes
      let requestBody: any = {};
      
      try {
        // Check if ctx.request.body has actual content (not just empty object)
        if (ctx.request.body && 
            typeof ctx.request.body === 'object' && 
            Object.keys(ctx.request.body).length > 0) {
          strapi.log.info('📦 Using parsed body from middleware');
          requestBody = ctx.request.body;
        } else {
          strapi.log.info('📦 Reading raw body from request');
          // Otherwise, read and parse raw body
          const rawBody = await new Promise<string>((resolve, reject) => {
            let data = '';
            let received = false;
            
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
              if (!received) {
                reject(new Error('Body parsing timeout'));
              } else {
                resolve(data);
              }
            }, 5000);
            
            ctx.req.on('data', (chunk: any) => {
              received = true;
              data += chunk.toString();
            });
            
            ctx.req.on('end', () => {
              clearTimeout(timeout);
              resolve(data);
            });
            
            ctx.req.on('error', (err: any) => {
              clearTimeout(timeout);
              reject(err);
            });
          });
          
          if (rawBody && rawBody.trim()) {
            requestBody = JSON.parse(rawBody);
            strapi.log.info('📦 Raw body parsed successfully');
          } else {
            strapi.log.warn('⚠️  Empty raw body received');
          }
        }
      } catch (error: any) {
        strapi.log.error('❌ Error parsing request body:', error.message);
        ctx.status = 400;
        ctx.body = { error: { message: 'Invalid request body' } };
        return;
      }

      const { confirmationToken, email, password, username } = requestBody;

      strapi.log.info('📥 Registration confirm endpoint called');
      strapi.log.info('📧 Email:', email);
      strapi.log.info('👤 Username:', username);
      strapi.log.info('🔑 Token:', confirmationToken);
      strapi.log.info('📦 Parsed request body:', JSON.stringify(requestBody));

      try {
        // Find user with matching confirmationToken
        const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: {
            confirmationToken: confirmationToken,
            email: email,
          },
        });

        strapi.log.info('🔍 Found users:', users ? users.length : 0);

        if (!users || users.length === 0) {
          strapi.log.error('❌ Invalid or expired confirmation token');
          ctx.status = 400;
          ctx.body = { error: { message: 'Invalid or expired confirmation token' } };
          return;
        }

        const user = users[0];

        strapi.log.info('✅ Valid confirmation token found for:', user.email);

        // Update user with password, username (if provided), and confirm account
        const updatedUser = await strapi.entityService.update(
          'plugin::users-permissions.user',
          user.id,
          {
            data: {
              password: password,
              username: username || user.username,
              confirmed: true,
              confirmationToken: null, // Clear confirmationToken after use
            },
          }
        );

        strapi.log.info('✅ User updated with password and confirmed');

        // Create JWT token
        const jwt = strapi.service('plugin::users-permissions.jwt').issue({
          id: updatedUser.id,
        });

        strapi.log.info('✅ JWT token created');

        // Return response with JWT and user
        ctx.body = {
          jwt: jwt,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            confirmed: true,
          },
        };
      } catch (error: any) {
        strapi.log.error('❌ Error processing registration confirmation:', error);
        ctx.status = 400;
        ctx.body = { error: { message: 'Error processing registration' } };
      }
    });
  },

  bootstrap({ strapi }) {
    // Bootstrap code
  },
};
