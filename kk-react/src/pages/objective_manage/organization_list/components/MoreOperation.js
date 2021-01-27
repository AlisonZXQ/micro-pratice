import React, { useState } from 'react';
import { Dropdown, Menu, Modal, message } from 'antd';
import MyIcon from '@components/MyIcon';
import { deleteModal } from '@shared/CommonFun';
import { deleteObjective, editObjective } from '@services/objective_manage';
import styles from '../index.less';

function MoreOperation({ data, parentData, refreshFun }) {
  const [visible, setVisible] = useState(false);
  const projectVO = data.projectVO || {};
  const productVO = data.productVO || {};
  const parentObjectiveVO = data.parentObjectiveVO || {};

  /**
   * @description - 取消对齐目标
   */
  const handleCancelParent = () => {
    const params = {
      id: data.id,
      parentId: 0,
    };
    editObjective(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('取消目标对齐成功！');
      setVisible(false);
      if (refreshFun && typeof refreshFun === 'function') {
        refreshFun();
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  /**
   * @description - 删除目标
   */
  const handleDelete = () => {
    if (projectVO.id || productVO.id) {
      return message.warn('当前目标已关联产品/项目，请解绑后再删除!');
    } else {
      deleteModal({
        title: '提示',
        content: '确认删除该目标吗？',
        okCallback: () => {
          deleteObjective({ id: data.id }).then(res => {
            if (res.code !== 200) return message.error(res.msg);
            message.success('删除目标成功！');
            if (refreshFun && typeof refreshFun === 'function') {
              refreshFun();
            }
          }).catch(err => {
            return message.error(err || err.message);
          });
        }
      });
    }

  };

  // 当前目标没有添加上级目标不展示
  const menu = () => {
    return (<Menu className={`m-menu u-pd5 ${styles.menu}`}>
      {
        parentObjectiveVO.id &&
        <div className="m-item" onClick={() => setVisible(true)}>取消对齐</div>
      }
      <div className="m-item" onClick={() => handleDelete()}>删除</div>
    </Menu>);
  };

  return (<span>
    <Dropdown
      overlay={menu()}
    >
      <MyIcon type="icon-gengduo" className={styles.more} />
    </Dropdown>
    <Modal
      visible={visible}
      title="取消对齐"
      onOk={() => handleCancelParent()}
      onCancel={() => setVisible(false)}
    >
      <div className={styles.tip}>你确定要取消该对齐关系吗？</div>
      <div className={styles.cancelContainer}>
        <div className={styles.parentName}>
          <MyIcon type="icon-cengji" className="u-mgr5" />
          <span>
            {parentData.name}
          </span>
        </div>
        <div className={styles.name}>
          <MyIcon type="icon-xiangshang" className="u-mgr5" />
          {data.name}
        </div>
      </div>

    </Modal>
  </span>);
}

export default MoreOperation;
