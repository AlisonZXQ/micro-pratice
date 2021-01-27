import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Input, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import Tabs from '@components/Tabs';
import MyIcon from '@components/MyIcon';
import { tabsData } from '@shared/ObjectiveManage';
import EditSelectUser from '@components/EditSelectUser';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { getUserList, handleSearchUser } from '@shared/CommonFun';
import StyleDatePicker from '@components/CustomAntd/StyleDatePicker';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import { LEVER_MAP } from '@shared/ReceiptConfig';
import { addObjective } from '@services/objective_manage';
import FilterTree from '@components/FilterTree';
import { getDeptLayerTreeData } from '@utils/helper';
import OrganizationList from './organization_list';
import OrganizationMap from './organization_map';
import ObjectiveManageQuery from './organization_list/components/ObjectiveListQuery';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

function Index(props: any) {
  const { drawerIssueId, currentUser, dispatch } = props;
  const user = currentUser.user || {};
  const [current, setCurrent] = useState('list');
  const [name, setName] = useState('');
  const [userList, setUserList] = useState<any>([]);
  const [responseUser, setResponseUser] = useState({});
  const [dueDate, setDueDate] = useState(moment());
  const listRef = useRef(null);


  const [deptId, setDeptId] = useState('');
  const deptFullLink = currentUser.deptFullLink || [];
  const currentDept = deptFullLink && deptFullLink[deptFullLink.length - 1] && deptFullLink[deptFullLink.length - 1].deptId;
  const index = deptFullLink.findIndex(it => it.deptId === deptId);
  const arr = deptFullLink.slice(0, index + 1);

  /**
   * @description - 添加目标
   */
  const handleAddObjective = () => {
    if (!name.trim().length) {
      return message.warn('目标名称不能为空！');
    }
    const params = {
      name,
      deptId: deptId || user.deptId,
      deptFullPath: deptId ? arr.map(it => it.deptName).join('-') : user.deptFullPath,
      responseEmail: responseUser.email || user.email,
      level: LEVER_MAP.P1,
      dueTime: moment(dueDate).valueOf(),
    }
    addObjective(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('添加目标成功！');
      listRef.current.getObjectiveListFun();
      setName('');
    }).catch(err => {
      return message.error(err || err.message);
    })
  }

  return (<div className={styles.container}>
    <div className={styles.header}>
      <Tabs
        tabsData={tabsData}
        defaultKey={'list'}
        className={styles.tabs}
        callback={(value: string) => setCurrent(value)}
      />
      {
        current === 'list' &&
        <div className={styles.selectForm}>
          <Input
            className={styles.input}
            placeholder="添加新目标，按回车键（Enter）保存"
            onPressEnter={e => handleAddObjective(e)}
            onChange={e => setName(e.target.value)}
            value={name}
            suffix={
              <span>
                <FilterTree
                  onChange={(value) => setDeptId(value[0])}
                  defaultValue={[deptId || currentDept]}
                  treeData={getDeptLayerTreeData(deptFullLink)}
                />

                <div className={styles.selectUser}>
                  <MyIcon type="icon-yonghu" className={styles.userIcon} />
                  <EditSelectUser
                    issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
                    value={responseUser.email || user.email}
                    dataSource={getUserList(responseUser.id ? responseUser : user, userList)}
                    handleSearch={(value: string) => handleSearchUser(value, (result: any) => {
                      setUserList(result)
                    })}
                    handleSaveSelect={(value: string, user: any) => {
                      setResponseUser({
                        id: value,
                        email: value,
                        name: user.label,
                      })
                    }}
                    required
                    type='detail'
                  />
                </div>
                <div className={styles.date}>
                  <MyIcon type="icon-rili" className={styles.dateIcon} />
                  <StyleDatePicker
                    onChange={(value: any) => {
                      console.log('value', value);
                      setDueDate(value);
                    }}
                    defaultValue={moment()}
                    required
                  />
                </div>
              </span>
            }
          />
        </div>
      }
    </div>
    <div>
      {
        current === 'list' &&
        <div onClick={e => e.stopPropagation()}>
          <OrganizationList {...props} ref={listRef} />
        </div>
      }
      {
        current === 'map' &&
        <div onClick={e => e.stopPropagation()}>
          <OrganizationMap {...props} />
        </div>
      }
    </div>

    {
      drawerIssueId &&
      <DrawerComponent
        refreshFun={() => {
          //
        }}
      />
    }
  </div>);
}

const mapStateToProps = (state: any) => {
  return {
    drawerIssueId: state.receipt.drawerIssueId,
    currentUser: state.user.currentUser,
    objectiveList: state.objectiveManage.objectiveList || [],
    objectiveMap: state.objectiveManage.objectiveMap || {},
    objectiveListLoading: state.loading.effects['objectiveManage/getObjectiveList'],
    objectiveMapLoading: state.loading.effects['objectiveManage/getObjectiveMap'],
  };
};

export default connect(mapStateToProps)(Index);
