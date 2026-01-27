export default {
  routes: [
    {
      method: 'GET',
      path: '/invite/validate',
      handler: 'invite.validate',
      config: {
        auth: false,
      },
    },
  ],
};
