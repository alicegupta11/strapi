'use strict';

const nodeCrypto = require('crypto');
const { Resend } = require('resend');

module.exports = (plugin) => {

  plugin.contentTypes.user.lifecycles = {
    async afterCreate(event) {
      try {
        const { result } = event;

        strapi.log.info('👤 User creation started');
        strapi.log.info(`📧 Email: ${result.email}`);
        strapi.log.info(`🆔 User ID: ${result.id}`);

        // Fetch user to get the confirmation token
        const user = await strapi.query('plugin::users-permissions.user').findOne({
          where: { id: result.id },
        });

        strapi.log.info(`📋 Retrieved user from database. Token exists: ${!!user.confirmationToken}`);

        // Generate confirmation token if it doesn't exist
        let confirmationToken = user.confirmationToken;
        
        if (!confirmationToken) {
          confirmationToken = nodeCrypto.randomBytes(20).toString('hex');
          strapi.log.info(`🔑 Generated token: ${confirmationToken}`);
          
          // Update the user with the generated token and set confirmed to false
          const updatedUser = await strapi.query('plugin::users-permissions.user').update({
            where: { id: result.id },
            data: { 
              confirmationToken,
              confirmed: false 
            },
          });
          
          strapi.log.info('✅ Updated user with confirmation token');
          strapi.log.info(`🔑 Confirmed token in database: ${updatedUser.confirmationToken}`);
          strapi.log.info(`✅ Confirmed status: ${updatedUser.confirmed}`);
        } else {
          strapi.log.info(`✅ Using existing token: ${confirmationToken}`);
        }

        // Use PUBLIC_URL from environment variable, fallback to localhost for local development
        const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1337';
        // Include email in the URL to pre-fill the disabled form field
        const registrationLink = `${publicUrl}/admin/auth/register?confirmationToken=${confirmationToken}&email=${encodeURIComponent(result.email)}`;

        strapi.log.info(`🔗 Registration Link: ${registrationLink}`);

        // Initialize Resend client
        const resendApiKey = process.env.RESEND_API_KEY;
        const resendFromEmail = process.env.RESEND_FROM_EMAIL;
        
        if (!resendApiKey || !resendFromEmail) {
          strapi.log.warn('⚠️ RESEND_API_KEY or RESEND_FROM_EMAIL not found in environment variables. Email will not be sent.');
          return;
        }

        const resend = new Resend(resendApiKey);
        strapi.log.info(`📧 Sending email via Resend from: ${resendFromEmail}`);

        try {
          await resend.emails.send({
            from: resendFromEmail,
            to: result.email,
            subject: 'Welcome! Complete Your Registration',
            text: `
Hi ${result.username || 'User'},

Welcome! 

Please complete your registration using the link below:
${registrationLink}

If you did not request this, you can ignore this email.
          `,
            html: `
            <p>Hi <b>${result.username || 'User'}</b>,</p>

            <p>Welcome!</p>

            <p>Please complete your registration by clicking the link below:</p>

            <p>
              <a href="${registrationLink}" target="_blank">
                Complete Registration
              </a>
            </p>

            <p>If you did not request this, you can safely ignore this email.</p>
          `,
          });

          strapi.log.info('✅ Welcome email sent successfully via Resend');
        } catch (emailError) {
          strapi.log.error('❌ Failed to send welcome email via Resend');
          strapi.log.error(emailError);
        }
      } catch (error) {
        strapi.log.error('❌ Error in user creation lifecycle');
        strapi.log.error(error);
      }
    },
  };

  return plugin;
};
