import { Context } from '@koa/router';

console.log('🚀 Registration Controller Loaded');

export default {
  async confirm(ctx: Context) {
    console.log('📥 Registration confirm endpoint called');
    console.log('📥 Request method:', ctx.request.method);
    console.log('📥 Request path:', ctx.request.path);
    console.log('📥 Request headers:', JSON.stringify(ctx.request.headers, null, 2));

    const { confirmationToken, email, password, username } = ctx.request.body;

    console.log('🔑 Processing registration confirmation');
    console.log('📧 Email:', email);
    console.log('👤 Username:', username);
    console.log('🔑 Token:', confirmationToken);

    try {
      console.log('🔍 Finding user with matching confirmationToken...');
      
      // Find user with matching confirmationToken
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          confirmationToken: confirmationToken,
          email: email,
        },
      });

      console.log('🔍 Found users:', users ? users.length : 0);

      if (!users || users.length === 0) {
        console.log('❌ Invalid or expired confirmation token');
        return ctx.badRequest('Invalid or expired confirmation token');
      }

      const user = users[0];

      console.log('✅ Valid confirmation token found for:', user.email);
      console.log('👤 User ID:', user.id);

      // Update user with password, username (if provided), and confirm account
      console.log('🔄 Updating user with password and confirming account...');
      
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
      console.log('✅ User details:', {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        confirmed: true,
      });

      // Create JWT token
      console.log('🔐 Creating JWT token...');
      const jwt = strapi.service('plugin::users-permissions.jwt').issue({
        id: updatedUser.id,
      });

      console.log('✅ JWT token created');

      // Return response with JWT and user
      const response = {
        jwt: jwt,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          confirmed: true,
        },
      };

      console.log('📤 Sending response:', JSON.stringify(response, null, 2));
      
      ctx.body = response;
    } catch (error: any) {
      console.error('❌ Error processing registration confirmation:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return ctx.badRequest('Error processing registration');
    }
  },
};