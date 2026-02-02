'use strict';

const { Resend } = require('resend');

module.exports = (plugin) => {

  plugin.contentTypes.user.lifecycles = {
    async afterCreate(event) {
      try {
        const { result } = event;

        strapi.log.info('👤 User creation started (Content Manager)');
        strapi.log.info(`📧 Email: ${result.email}`);

        // 1. Check if Admin User already exists
        const existingAdminUser = await strapi.db.query('admin::user').findOne({
          where: { email: result.email },
        });

        if (existingAdminUser) {
          strapi.log.warn('⚠️ Admin User with this email already exists. Skipping Admin User creation.');
          return;
        }

        // 2. Get Default Role for new Admin Users (Author or Editor)
        // We look for 'Author' role first, then fall back to any role
        let defaultRole = await strapi.db.query('admin::role').findOne({
          where: { code: 'strapi-author' }, // Default Author role code
        });

        if (!defaultRole) {
          defaultRole = await strapi.db.query('admin::role').findOne({
            where: { code: 'strapi-editor' }, // Fallback to Editor
          });
        }

        // If still no role, just grab the first one that isn't Super Admin (usually ID 1) to be safe, or just fail
        if (!defaultRole) {
          strapi.log.warn('⚠️ No "Author" or "Editor" role found. Cannot create Admin User safely.');
          return;
        }

        strapi.log.info(`✅ Assigning Role: ${defaultRole.name} (ID: ${defaultRole.id})`);

        // 3. Create the Admin User
        // usage: strapi.admin.services.user.create({ ...params })
        const newAdminUser = await strapi.admin.services.user.create({
          email: result.email,
          firstname: result.username || 'New',
          lastname: 'User',
          roles: [defaultRole.id],
          isActive: true, // User is active but needs registration (password set)
        });

        strapi.log.info('✅ Admin User created successfully');
        strapi.log.info(`🆔 Admin ID: ${newAdminUser.id}`);

        // 4. Fetch the user to get the automatically generated registrationToken
        const adminUserWithToken = await strapi.db.query('admin::user').findOne({
          where: { id: newAdminUser.id },
        });

        if (!adminUserWithToken || !adminUserWithToken.registrationToken) {
          strapi.log.error('❌ Registration token not found on admin user');
          return;
        }

        const registrationToken = adminUserWithToken.registrationToken;
        strapi.log.info(`🔑 Registration Token: ${registrationToken}`);

        // 5. Construct Standard Strapi Registration URL
        const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1337';
        const registrationLink = `${publicUrl}/admin/auth/register?registrationToken=${registrationToken}`;

        strapi.log.info(`🔗 Admin Registration Link: ${registrationLink}`);

        // 6. Send Email via Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        const resendFromEmail = process.env.RESEND_FROM_EMAIL;

        if (!resendApiKey || !resendFromEmail) {
          strapi.log.warn('⚠️ RESEND_API_KEY or RESEND_FROM_EMAIL not found. Email not sent.');
          return;
        }

        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: resendFromEmail,
          to: result.email,
          subject: 'Invite: Join the Strapi Dashboard',
          html: `
            <p>Hi ${result.username || 'User'},</p>
            <p>You have been invited to join the Strapi Administration Panel.</p>
            <p>Please click the link below to set your password and access the dashboard:</p>
            <p><a href="${registrationLink}">Complete Registration</a></p>
          `,
        });

        strapi.log.info('✅ Invitation email sent successfully');

      } catch (error) {
        strapi.log.error('❌ Error in automatic admin user creation');
        strapi.log.error(error);
      }
    },
  };

  return plugin;
};
