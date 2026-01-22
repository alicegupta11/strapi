export default ({ env }) => ({
    email: {
      config: {
        provider: 'nodemailer',
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
          defaultFrom: 'no-reply@test.com',
          defaultReplyTo: 'no-reply@test.com',
        },
      },
    },
  });
  