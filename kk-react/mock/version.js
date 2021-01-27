import { requirementFilter, requirementList, versionList, versionSelect,
  versionFilter, versionDetail, publishVersionCon } from '../src/pages/receipt/version/shared/data';

export default {
  '/api/getRequirementFilter': {
    code: 200,
    message: 'ok',
    result: requirementFilter
  },

  'GET /api/getRequirementObj': (req, res) => {
    setTimeout(() => {
      res.send({
        code: 200,
        message: 'ok',
        result: {
          total: 12,
          list: requirementList,
        }
      });
    }, 3000);
  },

  'GET /api/getVersionList': (req, res) => {
    setTimeout(() => {
      res.send({
        code: 200,
        message: 'ok',
        result: versionList
      });
    }, 3000);
  },

  'GET /api/getVersionSelect': (req, res) => {
    setTimeout(() => {
      res.send({
        code: 200,
        message: 'ok',
        result: versionSelect
      });
    }, 3000);
  },

  '/api/getVersionFilter': {
    code: 200,
    message: 'ok',
    result: versionFilter
  },

  '/api/getVersionDetail': {
    code: 200,
    message: 'ok',
    result: versionDetail
  },

  '/api/getPublishVersionCon': {
    code: 200,
    message: 'ok',
    result: publishVersionCon
  }
};
