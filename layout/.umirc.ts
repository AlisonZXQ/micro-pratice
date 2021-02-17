import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  layout: {
    name: 'Ant Design',
    locale: true,
    layout: 'side',
  },
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
      },
      // {
      //   name: 'ep',
      //   entry: 'http://localhost:7000',
      //   props: {
      //     first: 'hello-ep',
      //   }
      // },
      {
        name: 'sub-react',
        entry: 'http://localhost:8100',
        props: {
          first: 'hello-sub-react',
        }
      }, {
        name: 'umi2-ep',
        entry: 'http://localhost:9000',
        props: {
          first: 'hello-sub-umi2-ep',
        }
      }, {
        name: 'easyproject',
        entry: 'http://localhost:7000',
        props: {
          first: 'hello-easyproject',
        }
      }, {
        name: 'pmo-component-lib',
        entry: 'http://localhost:8100',
        props: {
          first: 'hello-dumi',
        }
      }, {
        name: 'ep-umi2',
        entry: 'http://localhost:8006',
        props: {
          first: 'hello-ep-umi2',
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
        // { path: '/ep', microApp: 'ep' },
        { path: '/sub-react', microApp: 'sub-react' },
        { path: '/umi2-ep', microApp: 'umi2-ep' },
        { path: '/easyproject', microApp: 'easyproject' },
        { path: '/docs', microApp: 'pmo-component-lib' },
        { path: '/v2', microApp: 'ep-umi2' },
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
