import React from 'react';
import { Popover, Menu, message } from 'antd';
import MyIcon from '@components/MyIcon';
import { BOARD_FILTER_TYPE, BOARD_DEFAULT } from '@shared/RequirementConfig';
import { deleteModal } from '@shared/CommonFun';
import { deleteKanban, setDefaultKanban } from '@services/requirement_board';
import styles from '../index.less';

function KanbanMenu({ kanbanList, handleClickGetIssue, getKanbanList, setCurrentKanban }) {

  const handleDelete = (item) => {
    deleteModal({
      title: '删除看板',
      content: '删除后该看板将对该用户不可见，你确定要继续吗？',
      okCallback: () => {
        deleteKanban(item.id).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          getKanbanList();
          setCurrentKanban({});
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  };

  const handleSetDefault = (item) => {
    setDefaultKanban({ id: item.id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('设置默认看版成功！');
      getKanbanList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const menu = () => {
    const system = kanbanList.filter(it => it.type === BOARD_FILTER_TYPE.ALL || it.type === BOARD_FILTER_TYPE.ALL_OPEN);
    const create = kanbanList.filter(it => it.type !== BOARD_FILTER_TYPE.ALL && it.type !== BOARD_FILTER_TYPE.ALL_OPEN);

    const getList = (list) => {
      return list.map(item =>
        <div
          onClick={() => handleClickGetIssue(item)}
          className={styles.kanban}
        >
          <span>{item.name}</span>
          <span className={`f-fr ${item.isDefault !== BOARD_DEFAULT.DEFAULT ? styles.opt : ''}`}>
            {
              // item.type !== BOARD_FILTER_TYPE.SYSTEM
              //   &&
              <a
                className={`delColor u-mgr5 ${styles.delete}`}
                onClick={() => handleDelete(item)}
              >删除</a>
            }
            <Popover
              overlayStyle={{ zIndex: '9999' }}
              content={<span>设为默认</span>}
            >
              <MyIcon
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetDefault(item);
                }}
                type="icon-morengou"
                className={item.isDefault === BOARD_DEFAULT.DEFAULT ? styles.defaultIcon : styles.unDefaultIcon}
                style={{ fontSize: '12px', paddingLeft: '5px' }}
              />
            </Popover>
          </span>
        </div>);
    };

    return (<Menu className={styles.menu}>
      <div>
        {getList(system)}
      </div>
      {
        create && !!create.length && system && system.length &&
        <div className={styles.divider}>
        </div>
      }
      <div>
        {getList(create)}
      </div>
    </Menu>);
  };

  return (
    menu()
  );
}

export default KanbanMenu;
