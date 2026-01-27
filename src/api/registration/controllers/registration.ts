'use strict';

module.exports = {
  async confirm(ctx) {
    const { confirmationToken, email, password, username } = ctx.request.body;

    console.log('🔑 Processing registration confirmation');
    console.log('📧 Email:', email);
    console.log('👤 Username:', username);
    console.log('🔑 Token:', confirmationToken);

    try {
      // Find user with matching confirmationToken
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
    } catch (error) {
      console.error('❌ Error processing registration confirmation:', error);
      console.error('Error details:', error.message);
      return ctx.badRequest('Error processing registration');
    }
  },
};
