import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Input, Table, Popover, Button, message } from 'antd';
import moment from 'moment';
import useDeepCompareEffect from 'use-deep-compare-effect';
import DefineDot from '@components/DefineDot';
import MyIcon from '@components/MyIcon';
import Modal from '@components/CustomAntd/modal';
import FilterSelect from '@components/FilterSelect';
import { jiraStatusMap, PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import TextOverFlow from '@components/TextOverFlow';
import StyleDatePicker from '@components/CustomAntd/StyleDatePicker';
import EpIcon from '@components/EpIcon';
import JiraIcon from '@components/JiraIcon';
import { arrDeduplication } from '@utils/helper';
import { customExpandIcon } from '@shared/CommonFun';
import { setTreeData, getList } from './CommonTemplateFun';

const { Search } = Input;

function AddIssueModal(props, ref) {
  const { trigger, plannings, dataSource, value } = props;
  const [visible, setVisible] = useState(false);
  const [expandKeys, setExpandKeys] = useState([]);
  const [filterObj, setFilterObj] = useState({});
  const [selectKeys, setSelectKeys] = useState([]);

  // 默认值恢复
  useDeepCompareEffect(() => {
    setSelectKeys(value.map(it => it.issueKey));
  }, [value]);

  useImperativeHandle(ref, () => {
    return {
      setRemoveNewKeys,
    };
  });

  const setRemoveNewKeys = (removeKeys) => {
    const newSelectKeys = [];
    selectKeys.forEach(it => {
      if (!removeKeys.includes(it)) {
        newSelectKeys.push(it);
      }
    });
    setSelectKeys(newSelectKeys);

    const issues = [];
    newSelectKeys.forEach(item => {
      const obj = plannings.find(it => it.issueKey === item);
      issues.push(obj);
    });
    props.onChange(issues);
  };

  const getAllKeys = () => {
    let arr = getList(plannings);
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
    width: '400px',
    render: (text, record) => {
      const datasource = dataSource || PROJECT_DATASOURCE.EP;

      return (<Popover
        content={text}>
        <span
          style={{ maxWidth: '350px', lineHeight: '10px' }}
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
    width: '150px',
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
    title: '负责人',
    dataIndex: 'assignee',
    width: '150px',
    render: (text) => {
      return (
        text ? <TextOverFlow content={text} maxWidth={'150px'} /> : '-'
      );
    }
  }, {
    title: '到期日',
    dataIndex: 'dueDate',
    render: (text) => {
      return (
        text ? text : '-'
      );
    }
  }];

  const updateFilter = (key, value) => {
    const newFilterObj = {
      ...filterObj,
      [key]: value
    };
    setFilterObj(newFilterObj);
  };

  const getFilterOptions = () => {
    return (<span className="u-mgb10 f-ib">
      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">到期日：</span>
        <StyleDatePicker onChange={(value) => updateFilter('dueDate', value)} />
      </span>


      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('status', value)}
          dataSource={arrDeduplication(list && list.map(it => it.status)).map((item) => ({
            label: item, value: item,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">负责人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('assignee', value)}
          dataSource={arrDeduplication(list && list.map(it => it.assignee)).map((item) => ({
            label: item, value: item,
          }))}
        />
      </span>

      <span className="u-mgl20">
        <Search
          placeholder="搜索标题或ID"
          onChange={e => updateFilter('summary', e.target.value)}
          enterButton
          style={{ width: 200 }}
        />
      </span>
    </span>);
  };

  const processData = (data) => {
    const { status, summary, assignee, dueDate } = filterObj;

    return data &&
      data.filter(item => !status || !status.length || status.includes(item.status))
        .filter(item => !summary || !summary.length || item.summary.includes(summary))
        .filter(item => !assignee || !assignee.length || assignee.includes(item.assignee))
        .filter(item => !dueDate || (item.dueDate && item.dueDate === moment(dueDate).format('YYYY-MM-DD')));
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

  const list = getList(plannings);
  const dataList = setTreeData(processData(list));

  const getTreeTable = () => {
    return (<span>
      <Table
        rowKey={record => record.issueKey}
        rowSelection={{
          selectedRowKeys: selectKeys,
          // onChange: (value) => {
          //   setSelectKeys(value);
          // },
          onSelect: (data, selected) => {
            let newSelectKeys = [...selectKeys];
            const childKeys = [];
            const getChildKeys = (children) => {
              children && children.forEach(it => {
                if (!childKeys.some(i => i === it.issueKey)) {
                  childKeys.push(it.issueKey);
                  if (it.children) {
                    getChildKeys(it.children || []);
                  }
                }
              });
            };
            getChildKeys(data.children || []);
            // 取消选中
            if (!selected) {
              newSelectKeys = newSelectKeys.filter(it => it !== data.issueKey);
              childKeys.forEach(it => {
                newSelectKeys = newSelectKeys.filter(i => i !== it);
              });
            // 选中
            } else {
              newSelectKeys.push(data.issueKey);
              childKeys.forEach(it => {
                if (newSelectKeys.some(i => i !== it)) {
                  newSelectKeys.push(it);
                }
              });
            }
            setSelectKeys(newSelectKeys);
          }
        }}
        size="middle"
        columns={columns}
        dataSource={dataList}
        expandedRowKeys={expandKeys}
        pagination={false}
        onExpand={(flag, record) => handleRowExpand(flag, record)}
        expandIcon={(props) => customExpandIcon(props)}
        scroll={{ y: 400 }}
      />
    </span>
    );
  };

  const handleOk = () => {
    const issues = [];
    selectKeys.forEach(item => {
      const obj = plannings.find(it => it.issueKey === item);
      issues.push(obj);
    });
    props.onChange(issues);
    setVisible(false);
    message.success('已成功添加');
  };

  return (<div>
    <span onClick={() => setVisible(true)}>{trigger}</span>
    <Modal
      title="添加"
      visible={visible}
      onCancel={() => setVisible(false)}
      footer={<span>
        <Button onClick={() => setVisible(false)}>取消</Button>
        <Button type="primary" onClick={() => handleOk()}>确定（{selectKeys.length}）</Button>
      </span>}
      width={1000}
    >
      {getFilterOptions()}
      {getTreeTable()}
    </Modal>
  </div>);
}


export default forwardRef(AddIssueModal);
