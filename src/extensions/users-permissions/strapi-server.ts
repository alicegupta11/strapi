'use strict';

module.exports = (plugin) => {

  plugin.contentTypes.user.lifecycles = {
    async afterCreate(event) {
      try {
        const { result } = event;

        const registrationLink =
          'http://localhost:1337/admin/auth/register?registrationToken=d06af5773f2ecfb6ca15cfd0a9c205a607beee6c';

        strapi.log.info('👤 User created');
        strapi.log.info(`📧 Email: ${result.email}`);

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

            <p>Welcome! </p>

            <p>Please complete your registration by clicking the link below:</p>

            <p>
              <a href="${registrationLink}" target="_blank">
                Complete Registration
              </a>
            </p>

            <p>If you did not request this, you can safely ignore this email.</p>
          `,
        });

        strapi.log.info(' Welcome email sent');

      } catch (error) {
        strapi.log.error(' Failed to send welcome email');
        strapi.log.error(error);
      }
    },
  };

  return plugin;
};
