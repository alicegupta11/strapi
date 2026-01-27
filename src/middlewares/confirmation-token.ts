'use strict';

module.exports = async (ctx, next) => {
  // Check if this is a registration request with a confirmation token
  if (
    ctx.path === '/api/auth/local/register' &&
    ctx.method === 'POST' &&
    ctx.request.body && ctx.request.body.confirmationToken
  ) {
    console.log('🔑 Processing registration with confirmation token');

    const { confirmationToken, email, password, username } = ctx.request.body;

    try {
      // Find user with matching confirmationToken and email
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          confirmationToken: confirmationToken,
          email: email,
        },
      });

      if (!users || users.length === 0) {
        console.log('❌ Invalid or expired confirmation token');
        return ctx.badRequest('Invalid or expired confirmation token');
      }

      const user = users[0];
      console.log('✅ Valid confirmation token found for:', user.email);
      console.log('👤 User ID:', user.id);

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

      console.log('✅ User updated with password and confirmed');

      // Create JWT token
      const jwt = strapi.service('plugin::users-permissions.jwt').issue({
        id: updatedUser.id,
      });

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

      return;
    } catch (error) {
      console.error('❌ Error processing confirmation token:', error);
      console.error('Error details:', error.message);
      return ctx.badRequest('Error processing registration');
    }
  }

  await next();
};
