import { Context } from '@koa/router';

export default {
  async validate(ctx: Context) {
    const { token } = ctx.query;

    if (!token) {
      return ctx.badRequest('Token is required');
    }

    try {
      console.log('🔑 Validating invite token:', token);

      // Find user with matching confirmationToken
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          confirmationToken: token,
        },
      });

      if (!users || users.length === 0) {
        console.log('❌ Invalid or expired token');
        return ctx.badRequest('Invalid or expired token');
      }

      const user = users[0];
      console.log('✅ Valid token found for:', user.email);

      ctx.body = {
        email: user.email,
        username: user.username,
      };
    } catch (error: any) {
      console.error('❌ Error validating token:', error);
      ctx.badRequest(error.message);
    }
  },

  async create(ctx: Context) {
    const { email, userId } = ctx.request.body;

    if (!email || !userId) {
      return ctx.badRequest('Email and userId are required');
    }

    try {
      console.log('📧 Creating invite for user:', email);

      // Generate a unique confirmation token
      const token = generateToken(64);

      // Store invitation data
      const inviteData = {
        email,
        token,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      const invite = await strapi.entityService.create('api::invite.invite', {
        data: inviteData,
      });

      console.log('✅ Invite created with ID:', invite.id);

      // Fetch user to get username for the registration URL
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);

      // Update user with confirmation token so registration can find them
      if (user) {
        await strapi.entityService.update('plugin::users-permissions.user', userId, {
          data: {
            confirmationToken: token,
            confirmed: false,
          },
        });
        console.log('✅ User updated with confirmation token');
      }

      // Send email with registration link
      await sendRegistrationEmail(email, token, user?.username);

      ctx.body = {
        success: true,
        inviteId: invite.id,
        message: 'Invitation sent successfully',
      };
    } catch (error: any) {
      console.error('❌ Error creating invite:', error);
      ctx.badRequest(error.message);
    }
  },

  async find(ctx: Context) {
    try {
      const invites = await strapi.entityService.findMany('api::invite.invite');

      ctx.body = invites;
    } catch (error: any) {
      ctx.badRequest(error.message);
    }
  },
};

function generateToken(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function sendRegistrationEmail(email: string, token: string, username?: string) {
  try {
    const resend = require('resend');
    const resendClient = new resend.Resend(strapi.config.get('plugin.email.RESEND_API_KEY'));
    const fromEmail = strapi.config.get('plugin.email.RESEND_FROM_EMAIL', 'send@droidvm.dev');

    // Create registration URL pointing to custom registration page
    const registrationUrl = `http://localhost:1337/registration?confirmationToken=${token}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username || 'user')}`;

    console.log('📧 Sending email via Resend from:', fromEmail);
    console.log('🔗 Registration URL:', registrationUrl);

    const data = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Complete Your Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome! Complete Your Registration</h2>
          <p style="color: #666; font-size: 16px;">You've been invited to join our platform. Please complete your registration by clicking on button below.</p>
          <div style="margin: 30px 0;">
            <a href="${registrationUrl}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Complete Registration</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #0066cc; font-size: 14px; word-break: break-all;">${registrationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
        </div>
      `,
    });

    console.log('✅ Welcome email sent successfully via Resend');
  } catch (error: any) {
    console.error('❌ Error sending email via Resend:', error);
    throw error;
  }
}
