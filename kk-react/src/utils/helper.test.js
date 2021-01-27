import { setTreeData } from '@utils/tree';
import {
  arrDeduplication, getFormLayout, obj2query, dateDiff, isObject, isArray, equalsObj, deepCopy,
  getHumanTime, getHumanSize
} from '@utils/helper';

const data = [{
  key: 'music-1',
  parentKey: null,
}, {
  key: 'music-2',
  parentKey: 'music-1',
}, {
  key: 'music-3',
  parentKey: 'music-2',
}];

const data2 = [{
  key: 'music-1',
  parentKey: null,
}, {
  key: 'music-2',
  parentKey: 'music-1',
}, {
  key: 'music-3',
  parentKey: 'music-2',
}, {
  key: 'music-4',
  parentKey: null,
}, {
  key: 'music-5',
  parentKey: 'music-4',
}];

const data3 = [{
  key: 'music-1',
  parentKey: null,
}, {
  key: 'music-2',
  parentKey: null,
}, {
  key: 'music-3',
  parentKey: 'music-2',
}, {
  key: 'music-4',
  parentKey: 'music-3',
}];

describe('测试js组成多层级树', () => {
  it('测试第一组数据只包含2个父节点', () => {
    expect(setTreeData(data).map(it => it.key)).toEqual(['music-1', 'music-2', 'music-3']);
  });

  it('测试第二组数据包含5个父节点', () => {
    expect(setTreeData(data2).map(it => it.key)).toEqual(['music-1', 'music-2', 'music-3', 'music-4', 'music-5']);
  });

  it('测试组装成所有的节点都有的树', () => {
    expect(setTreeData(data3)).toEqual([{
      key: 'music-1',
      parentKey: null,
    }, {
      key: 'music-2',
      parentKey: null,
      children: [{
        key: 'music-3',
        parentKey: 'music-2',
        children: [{
          key: 'music-4',
          parentKey: 'music-3',
        }]
      }]
    }, {
      key: 'music-3',
      parentKey: 'music-2',
      children: [{
        key: 'music-4',
        parentKey: 'music-3',
      }]
    }, {
      key: 'music-4',
      parentKey: 'music-3',
    }]);
  });
});

describe('数组去重方法测试', () => {
  it('当输入带有重复元素的数组时，应该去重', () => {
    expect(arrDeduplication([1, 2, 2, 3, 4, 4, 5])).toStrictEqual([1, 2, 3, 4, 5]);
  });
  it('当输入不含重复元素的数组时，原样返回', () => {
    expect(arrDeduplication([1, 2, 3])).toStrictEqual([1, 2, 3]);
  });
  it('当输入空数组时，原样返回', () => {
    expect(arrDeduplication([])).toStrictEqual([]);
  });
  it('测试数组去重复方法字符串', () => {
    expect(arrDeduplication(['test-1', 'test-2', 'test-2', 'test-3'])).toEqual(['test-1', 'test-2', 'test-3'])
  })
});

describe('表单样式测试', () => {
  it('表单样式输入4，18时', () => {
    expect(getFormLayout(4, 18)).toEqual({
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    });
  });
});

describe('对象健值对的组装', () => {
  test('对象健值对的组装', () => {
    expect(obj2query({
      name: 'zhangxueqing',
      sex: 'female',
      age: 24,
    })).toBe(`name=zhangxueqing&sex=female&age=24`);
  });
});

describe('两个string类型的日期相减', () => {
  test('2020-09-20 - 2020-08-20', () => {
    expect(dateDiff('2020-08-20', '2020-09-20')).toEqual(31);
  })
});

test('判断是否是object', () => {
  expect(isObject({})).toBeTruthy()
})

test('判断是否是数组', () => {
  expect(isArray([1, 2, 3])).toBeTruthy()
})

describe('判断两个对象是否相等', () => {
  test('{} 和 []', () => {
    expect(equalsObj({}, [])).toBeFalsy()
  })

  test('{} 和 {}', () => {
    expect(equalsObj({}, {})).toBeTruthy()
  })

  test('{first: { second: { third: 3 } }} 和 {first: { second: { third: 4 } }}', () => {
    expect(equalsObj({ first: { second: { third: 3 } } }, { first: { second: { third: 4 } } })).toBeFalsy()
  })

  test('{first: { second: { third: 3 } }} 和 {first: { second: { third: 3 } }}', () => {
    expect(equalsObj({ first: { second: { third: 3 } } }, { first: { second: { third: 3 } } })).toBeTruthy()
  })
})

describe('复制对象', () => {
  test('复制对象', () => {
    expect(deepCopy({ first: { second: { third: 3 } } })).toEqual({ first: { second: { third: 3 } } })
  })

  test('复制数组', () => {
    expect(deepCopy([1, 2, 3], [])).toEqual([1, 2, 3])
  })
})

test('生成友好的时间', () => {
  expect(getHumanTime(1603180555959)).toEqual('4周前')
})

test('生成友好的字节大小', () => {
  expect(getHumanSize(60325)).toEqual('58.9KB');
})


