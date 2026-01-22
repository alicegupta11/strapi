export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: false,
  },
  http: {
    middleware: {
      security: {
        cors: {
          enabled: true,
          origin: env('CORS_ORIGIN', '*'),
          credentials: true,
        },
      },
    },
  },
});
