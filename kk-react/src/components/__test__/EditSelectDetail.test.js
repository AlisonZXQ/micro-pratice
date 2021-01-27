import React from 'react';
import { mount, shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Modal, Dropdown } from 'antd';
import mountTest from '@tests/shared/mountTest';
import EditSelectDetail from '../EditSelectDetail/index';

describe('EditSelectDetail', () => {

  const initState = {
    receipt: {}
  };
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore(initState);
  const setup = ({ ...props }) => {
    const wrapper = mount(<EditSelectDetail {...props} store={store} issueRole={1} />);
    return {
      wrapper,
    };
  };

  mountTest(EditSelectDetail, store);

  it('after click editIssue div component should contains Dropdown and handleSaveSelect should be have called', () => {
    const handleSaveSelect = jest.fn();

    const { wrapper } = setup({ handleSaveSelect: handleSaveSelect });

    expect(wrapper.find(Modal).exists()).toBe(true);
    expect(wrapper.find(Dropdown).exists()).toBe(false);

    wrapper.find('div.editIssue').simulate('click');
    expect(wrapper.find(Dropdown).exists()).toBe(true);

    wrapper.find('a').at(0).simulate('click');
    expect(handleSaveSelect).toHaveBeenCalled();
  })
})
