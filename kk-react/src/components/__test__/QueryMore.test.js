import mountTest from '@tests/shared/mountTest';
import configureStore from 'redux-mock-store';
import QueryMore from '../QueryMore';

describe('QueryMore', () => {
  const middleware = [];
  const mockStore = configureStore(middleware);
  const store = mockStore({
    createProject: {}
  });
  mountTest(QueryMore, store, { dataSource: [] });
})
