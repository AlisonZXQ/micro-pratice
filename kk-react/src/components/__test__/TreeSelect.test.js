import { shallow, mount } from 'enzyme';
import monutTest from '@tests/shared/mountTest';
import { Dropdown, TreeSelect } from 'antd';
import TreeSelectCom from '../TreeSelect';

describe('TreeSelect', () => {
  const defaultProps = {
    defaultData: []
  }
  monutTest(TreeSelectCom, null, defaultProps);

  const setup = (props) => {
    const mountWrapper = mount(<TreeSelectCom {...props} {...defaultProps} />);
    return {
      mountWrapper
    }
  }

  it('default should has Dropdown and should not has TreeSelect', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
    expect(mountWrapper.find(TreeSelect).exists()).toBe(false);
    expect(mountWrapper.find('.name').text()).toBe('全部');
    expect(mountWrapper.find(Icon).length).toBe(1);
  })

  it('when click dropdown there should be TreeSelect', () => {
    const callback = jest.fn();
    const { mountWrapper } = setup({
      updateFilter: callback,
      productList: [{
        productId: 1,
        name: '产品1',
        subProductVOList: [{ id: 11, subProductName: '子产品1' }]
      }]
    });
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
    console.log('mountWrapper.find(TreeSelect)', mountWrapper.find(Dropdown).debug())
    // mountWrapper.find(Dropdown).simulate('click')
    expect(mountWrapper.find(TreeSelect).exists()).toBe(true);
    mountWrapper.find(TreeSelect).simulate('change', [1], [1])
    expect(callback).toBeCalledWith([1])
    expect(mountWrapper.find('.name').text()).toBe('产品1');
    expect(mountWrapper.find(Icon).length).toBe(2);
  })
})
