import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { Popover, Table, Tooltip } from 'antd';
import MyIcon from '@components/MyIcon';
import { sleep } from '@tests/utils';
import mountTest from '@tests/shared/mountTest';
import CollectStar from '../index';

describe('CollectStar', () => {
  mountTest(CollectStar);

  const callback = jest.fn();
  const props = {
    collect: true,
    callback,
  }

  const shallowed = shallow(<CollectStar {...props} />);
  const mounted = mount(<CollectStar />);

  it('shallow should find Popover', () => {
    expect(shallowed.find(Popover).exists()).toBe(true)
    expect(shallowed.find(MyIcon).exists()).toBe(true)
    expect(shallowed.find(Tooltip).exists()).toBe(false)
  })

  it('mount should find ToolTip', () => {
    expect(mounted.find(Tooltip).exists()).toBe(true)
  })

  it('when collect pass true content popover content shoud be 取消收藏, else 收藏', () => {
    expect(shallowed.find(Popover).props().content).toBe('取消收藏');
  })

  it('when collect pass true MyIcon className shoud includes selectIcon', () => {
    expect(shallowed.find(MyIcon).props().className).toContain('selectIcon');
  })

  it('when click shoud trigger callback function', () => {
    const spanEle = shallowed.find('span').at(1);
    spanEle.simulate('click');
    expect(callback).toHaveBeenCalled();
  })
})
