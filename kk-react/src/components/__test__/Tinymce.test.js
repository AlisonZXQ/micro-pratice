import { mount } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import configureStore from 'redux-mock-store';
import { Editor } from '@tinymce/tinymce-react';
import TinyMCE from '../TinyMCE';

describe('TinyMCE', () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({
    design: {}
  });
  mountTest(TinyMCE, store);

  const setup = (props) => {
    const mountWrapper = mount(<TinyMCE store={store} {...props} />);
    return {
      mountWrapper
    }
  }

  it('should contanes Editor', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Editor).exists()).toBe(true)
  })
})
