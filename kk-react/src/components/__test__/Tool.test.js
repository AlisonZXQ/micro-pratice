import { shallow, mount } from 'enzyme';
import monutTest from '@tests/shared/mountTest';
import { Dropdown, Menu, Modal } from 'antd';
import Tool from '../Tool';

describe('Tool', () => {
  monutTest(Tool);

  const setup = (props) => {
    const mountWrapper = mount(<Tool {...props} />);
    return {
      mountWrapper
    }
  }

  it('should has Dropdown and should has Menu before click Dropdown', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
    expect(mountWrapper.find(Menu).exists()).toBe(false);
  })

  it('should has Menu after click Dropdown', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
    mountWrapper.find(Dropdown).simulate('click')
    expect(mountWrapper.find(Menu).exists()).toBe(true);
  })

  it('Modal prop visible first should be false, when click Menu and key equals to 2 visbile should be true', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Modal).exists()).toBe(true);
    expect(mountWrapper.find(Modal).prop('visible')).toBe(false);
    mountWrapper.find(Dropdown).simulate('click')
    mountWrapper.find(Menu.Item).at(1).simulate('click', { key: 2 })
    expect(mountWrapper.find(Modal).prop('visible')).toBe(true);
  })
})
