import React, { useState } from 'react';
import { Table, Popover } from 'antd';
import { PROJECT_DATASOURCE, jiraStatusMap } from '@shared/ProjectConfig';
import EpIcon from '@components/EpIcon';
import JiraIcon from '@components/JiraIcon';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import DefineDot from '@components/DefineDot';
import { customExpandIcon } from '@shared/CommonFun';
import { drawerDelayFun } from '@utils/helper';
import { getList, setTreeData } from './CommonTemplateFun';

/**
 *
 * @param {String} - planType current/next
 */
function WorkPlan(props) {
  const { dataSource, form: { getFieldValue }, planType, actionType } = props;
  const [expandKeys, setExpandKeys] = useState([]);
  const workPlanIssues = getFieldValue(`${planType}Plan`);

  const getAllKeys = () => {
    let arr = getList(workPlanIssues);
    let allExpandKeys = [];
    arr.forEach(it => {
      if (it.parentKey && arr.some(i => i.issueKey === it.parentKey) && !allExpandKeys.some(i => i === it.parentKey)) {
        allExpandKeys.push(it.parentKey);
      }
    });
    return allExpandKeys;
  };

  const columns = [{
    title: () => {
      const allExpandKeys = getAllKeys();
      return (
        <span style={allExpandKeys.length > 0 ? {} : { marginLeft: '26px' }}>
          {
            !!allExpandKeys.length &&
            <span>
              {
                allExpandKeys.length === expandKeys.length ?
                  <MyIcon type="icon-kuozhananniu" className="f-fs3 u-mgr10 f-csp" style={{ position: 'relative', top: '1px' }} onClick={() => setExpandKeys([])} />
                  :
                  <MyIcon type="icon-shousuoanniu" className="f-fs3 u-mgr10 f-csp" style={{ position: 'relative', top: '1px' }} onClick={() => setExpandKeys(getAllKeys())} />
              }
            </span>
          }
          标题
        </span>
      );
    },
    dataIndex: 'summary',
    width: '30vw',
    render: (text, record) => {
      const datasource = dataSource || PROJECT_DATASOURCE.EP;

      return (<Popover
        content={text}>
        <span
          style={{ maxWidth: '25vw', lineHeight: '10px' }}
          className="f-vam f-toe f-ib"
        >
          {datasource === PROJECT_DATASOURCE.EP ?
            <EpIcon type={record.issuetype} className='f-fs3' /> :
            <JiraIcon type={record.issuetype} />
          }
          <a className="u-mgl10"
            href={datasource !== PROJECT_DATASOURCE.EP && record.jiraUrl}
            rel="noopener noreferrer"
            target="_blank"
          >{text}</a>
        </span>
      </Popover>);
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    width: 150,
    render: (text, record) => {
      const txt = ['开始', '重新打开', '关闭'].includes(text) ? text : '其他';
      return (
        <DefineDot
          text={txt}
          statusColor={jiraStatusMap}
          displayText={text}
        />
      );
    }
  }, {
    title: '到期日',
    dataIndex: 'dueDate',
    width: 150,
    render: (text) => {
      return (
        text ? text : '-'
      );
    }
  }, {
    title: '负责人',
    dataIndex: 'assignee',
    width: 150,
    render: (text) => {
      return (
        text ? <TextOverFlow content={text} maxWidth={'150px'} /> : '-'
      );
    }
  }];

  const diffColumns = [{
    title: '最新工作日志',
    dataIndex: 'workloadVO',
    width: "20vw",
    render: (text, record) => {
      const data = text || {};
      return (
        <TextOverFlow content={data.workload ? `${data.workload}h/${data.description}/${data.createTime}` : '--'} maxWidth={'20vw'} />

      );
    },
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    width: '80px',
    render: (text, record) => {
      return (
        actionType !== 'view' ?
          <a className="delColor" onClick={(e) => { e.stopPropagation(); handleRemove(record.issueKey) }}>移除</a>
          : '--'
      );
    },
  }];

  const handleRemove = (key) => {
    const removeKeys = [];
    const currentIssuesArr = getList(workPlanIssues);
    currentIssuesArr.forEach(it => {
      if (it.parentKey === key) {
        removeKeys.push(it.issueKey);
      }
    });
    removeKeys.push(key);
    props.handleRemoveIssue(removeKeys);
  };

  const handleRowExpand = (flag, record) => {
    let newExpandKeys = [...expandKeys];
    if (flag) {
      newExpandKeys.push(record.issueKey);
    } else {
      newExpandKeys = newExpandKeys.filter(i => i !== record.issueKey);
    }
    setExpandKeys(newExpandKeys);
  };

  const list = getList(workPlanIssues);

  return (<>
    <Table
      rowKey={record => record.issueKey}
      columns={planType === 'current' ? [...columns, ...diffColumns] : columns}
      dataSource={setTreeData(list)}
      pagination={false}
      expandedRowKeys={expandKeys}
      onExpand={(flag, record) => handleRowExpand(flag, record)}
      expandIcon={(props) => customExpandIcon(props)}
      scroll={{ y: 400 }}
      onRow={(record) => {
        return {
          className: 'f-csp',
          onClick: (e) => {
            e.stopPropagation();
            if (dataSource === PROJECT_DATASOURCE.EP) {
              drawerDelayFun(() => {
                props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: record.issueKey });
              }, 200);
            }
          }
        };
      }}
    />
  </>);
}

export default WorkPlan;
