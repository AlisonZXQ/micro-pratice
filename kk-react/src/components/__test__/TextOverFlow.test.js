import { mount } from 'enzyme';
import { Popover } from 'antd';
import mountTest from '@tests/shared/mountTest';
import TextOverFlow from '../TextOverflow';

describe('TextOverFlow', () => {
  mountTest(TextOverFlow);

  const setup = (props) => {
    const mountWrapper = mount(<TextOverFlow {...props} />);
    return {
      mountWrapper,
    }
  }

  it('should has Popover', () => {
    const { mountWrapper } = setup();
    expect(mountWrapper.find(Popover).exists()).toBe(true);
  })

  it('should has Popover', () => {
    const { mountWrapper } = setup({
      maxWidth: '100px',
      content: <span>test</span>,
      className: 'test',
      style: { color: 'black' },
    });
    expect(mountWrapper.find(Popover).prop('maxWidth')).toBe('100px');
    expect(mountWrapper.find(Popover).prop('content')).toEqual(<span>test</span>);
    expect(mountWrapper.find(Popover).prop('className')).toBe('test');
    expect(mountWrapper.find(Popover).prop('style')).toEqual({ color: 'black' });
  })
})
