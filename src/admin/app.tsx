import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    console.log('🚀 STRAPI ADMIN APP LOADED');
  },
};
