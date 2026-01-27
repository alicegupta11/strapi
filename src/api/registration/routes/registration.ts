'use strict';

module.exports = {
  type: 'custom',
  routes: [
    {
      method: 'POST',
      path: '/confirm',
      handler: 'registration.confirm',
      config: {
        auth: false,
      },
    },
  ],
};
