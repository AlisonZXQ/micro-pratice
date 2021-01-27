import React, { useState } from 'react';
import { Button, Modal, Table } from 'antd';
import { calculateDwm } from '@utils/helper';

function PlanningManPower(props) {
  const { projectPlanning } = props;
  const [visible, setVisible] = useState(false);
  const [manpowerData, setManpowerData] = useState([]);

  const columns = [
    {
      title: '负责人',
      dataIndex: 'realname',
      key: 'realname',
      render: (text, record) => {
        return record.realname;
      }
    },
    {
      title: '预估工作量(人天)',
      dataIndex: 'estimate',
      key: 'estimate',
      render: (text, record) => {
        return record.estimate ? calculateDwm(record.estimate) : '0';
      }
    },
    {
      title: '实际工作量(人天)',
      dataIndex: 'act',
      key: 'act',
      render: (text, record) => {
        return record.act ? calculateDwm(record.act) : '0';
      }
    }
  ];
  const onClickManpower = () => {
    if (projectPlanning && projectPlanning.plannings && projectPlanning.plannings.length) {
      let manpowerData = [];
      let userMap = {};
      let parentKeys = {};
      const plannings = projectPlanning.plannings;

      //1. 收集所有父节点issueKey
      plannings.map(it => {
        if (it && it.issue && it.issue.parentKey) {
          parentKeys[it.issue.parentKey] = 1;
        }
      });

      // console.log('所有父节点issuekeys : %o', parentKeys);

      //2. 收集所有叶子节点对象
      let leafList = [];
      plannings.map(it => {
        if (it && it.issueKey && !Object.keys(parentKeys).includes(it.issueKey)) {
          leafList.push(it);
        }
      });

      // console.log('叶子节点：%o', leafList);

      //3. 收集所有负责人集合
      leafList.map(it => {
        const realname = (it.issue && it.issue.assignee) ? it.issue.assignee : '';
        if (!userMap[realname]) {
          manpowerData.push({
            realname: realname,
            estimate: 0,
            act: 0
          });
          userMap[realname] = 1;
        }
      });

      //4. 按负责人合并工作量
      leafList.map(it => {
        const realname = (it.issue && it.issue.assignee) ? it.issue.assignee : '';
        let currentUserManpower = manpowerData.filter(i => i.realname === realname);
        if (currentUserManpower && currentUserManpower[0]) {
          //4为关闭
          if (it.issue.statusid === 4) {
            currentUserManpower[0].act += (it.dwManpower && it.dwManpower.estimate) ? it.dwManpower.estimate : 0;
          }
          currentUserManpower[0].estimate += (it.dwManpower && it.dwManpower.estimate) ? it.dwManpower.estimate : 0;
        }
      });

      setVisible(true);
      setManpowerData(manpowerData);
    }
  };

  return (<>
    <Button className="u-mgr10" onClick={onClickManpower}>工作量汇总</Button>
    <Modal
      title="工作量汇总"
      visible={visible}
      onCancel={() => setVisible(false)}
      maskClosable={false}
      footer={null}
    >
      <div>
        <Table
          dataSource={manpowerData}
          columns={columns}
          pagination={false}
        />
      </div>
    </Modal>
  </>);
}

export default PlanningManPower;
