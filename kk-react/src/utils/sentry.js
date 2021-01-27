import { init } from '@sentry/browser';
import { isProduction } from './helper';

const SentryInit = () => {
  try {
    if (isProduction()) {
      init({
        dsn: 'https://76274d3a5bbc4639a65ea5fa0ff2c5f1@music-sentry.hz.netease.com/669',
      });
    }
  } catch (error) {
    // eslint-disable-next-line 
    console.error(`sentry初始化失败：${error}`);
  }
};

export {
  SentryInit,
};
