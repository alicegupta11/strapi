export default ({ env }) => ({
  // Note: Email sending has been migrated to Resend API for Railway compatibility
  // The SMTP configuration below is kept for reference but not used in production
  // 
  // Required environment variables for Resend:
  // - RESEND_API_KEY: Your Resend API key (e.g., re_BscsLTte_Hf5jAe6niuSgrYgk2RKqaLiv)
  // - RESEND_FROM_EMAIL: Sender email address (e.g., alish@rhombuz.io)
  //
  // Resend is used in src/extensions/users-permissions/strapi-server.ts
  // to send registration emails via HTTP API instead of SMTP
  // 
  // Email configuration using Resend (HTTP-based, works with Railway)
  email: {
    config: {
      provider: 'nodemailer', // Kept for compatibility, but not actively used
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env.int('SMTP_PORT'),
        secure: false,
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('RESEND_FROM_EMAIL', 'no-reply@test.com'),
        defaultReplyTo: 'no-reply@test.com',
      },
    },
  },
});
