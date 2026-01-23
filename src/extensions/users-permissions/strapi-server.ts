'use strict';

const nodeCrypto = require('crypto');

module.exports = (plugin) => {

  plugin.contentTypes.user.lifecycles = {
    async afterCreate(event) {
      try {
        const { result } = event;

        strapi.log.info('👤 User creation started');
        strapi.log.info(`📧 Email: ${result.email}`);
        strapi.log.info(`🆔 User ID: ${result.id}`);

        // Fetch the user to get the confirmation token
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

        const registrationLink = `http://localhost:1337/admin/auth/register?confirmationToken=${confirmationToken}`;

        strapi.log.info(`🔗 Registration Link: ${registrationLink}`);

        await strapi.plugin('email').service('email').send({
          to: result.email,
          subject: 'Welcome! Complete Your Registration',

          // Plain text email
          text: `
Hi ${result.username || 'User'},

Welcome! 

Please complete your registration using the link below:
${registrationLink}

If you did not request this, you can ignore this email.
          `,

          // HTML email
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

        strapi.log.info('✅ Welcome email sent successfully');

      } catch (error) {
        strapi.log.error('❌ Failed to send welcome email');
        strapi.log.error(error);
      }
    },
  };

  return plugin;
};
