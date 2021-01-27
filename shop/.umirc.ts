import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  base: 'shop',

  qiankun: {
    master: {
      apps: [{
        name: 'user',
        entry: 'http://localhost:8003'
      }]
    },
    slave: {}
  },
  routes: [
    { path: '/', component: '@/pages/shopList' },
    { path: '/:shopId', component: '@/pages/shopDetail' },
  ],
});
