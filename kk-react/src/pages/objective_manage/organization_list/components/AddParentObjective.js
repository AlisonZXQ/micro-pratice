import React, { useState } from 'react';
import { Button, Dropdown, Menu, Input, message } from 'antd';
import debounce from 'lodash/debounce';
import { getParentObjective, editObjective } from '@services/objective_manage';

function AddParentObjective({ data, refreshFun, deptId }) {
  const [parentObjectiveList, setParentObjectiveList] = useState([]);

  const handleSaveParent = (id) => {
    const params = {
      id: data.id,
      parentId: id,
    };
    editObjective(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('添加目标对齐成功！');
      if (refreshFun && typeof refreshFun === 'function') {
        refreshFun();
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const getParentObjectiveFun = debounce((value) => {
    const params = {
      deptId,
      keyWord: value,
    };
    getParentObjective(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      setParentObjectiveList(res.result || []);
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, 800);

  const menu = () => {
    return (<Menu
      className="m-menu u-pd5"
    >
      <div className="u-mgb10">
        <Input
          onChange={e => getParentObjectiveFun(e.target.value)}
          placeholder="请输入关键字搜索"
        />
      </div>
      {parentObjectiveList.length ?
        parentObjectiveList.map(it =>
          <div
            className="m-item f-toe"
            onClick={() => handleSaveParent(it.id)}
            style={{ maxWidth: '200px' }}
          >
            {it.name}
          </div>)
        :
        <span>暂无数据</span>
      }
    </Menu>);
  };

  return (<span>
    <Dropdown
      overlay={menu()}
      trigger={['click']}
    >
      <Button
        size="small"
        type="dashed"
        className="u-mgr10"
      >添加对齐目标</Button>
    </Dropdown>
  </span>);
}

export default AddParentObjective;
