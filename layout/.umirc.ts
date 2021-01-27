import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  layout: {},
  qiankun: {
    master: {
      apps: [{
        name: 'shop',
        entry: 'http://localhost:8004',
        props: {
          first: 'hello-shop',
        }
      }, {
        name: 'user',
        entry: 'http://localhost:8003',
        props: {
          first: 'hello-user',
        }
      }, {
        name: 'ep',
        entry: 'http://localhost:7000',
        props: {
          first: 'hello-ep',
        }
      }, {
        name: 'sub-react',
        entry: 'http://localhost:8100',
        props: {
          first: 'hello-sub-react',
        }
      }]
    },
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/', component: '@/pages/index' },
        { path: '/shop', microApp: 'shop' },
        { path: '/user', microApp: 'user' },
        { path: '/ep', microApp: 'ep' },
        { path: '/sub-react', microApp: 'sub-react' },
      ]
    }
  ],
  proxy: {
    '/api/shop': {
      target: 'http://localhost:8004',
    },
    '/api/user': {
      target: 'http://localhost:8003',
    },
    '/ep': {
      target: 'http://localhost:7000',
    },
    '/rest': {
      target: 'http://localhost:7000',
    },
    '/logout': {
      target: 'http://localhost:7000',
    },
  },
});
