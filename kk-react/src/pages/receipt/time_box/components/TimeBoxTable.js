import React, { useEffect, useState } from 'react';
import { Table, Button, Checkbox, Empty } from 'antd';
import moment from 'moment';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { calculateDwm, drawerDelayFun } from '@utils/helper';
import { ISSUE_TYPE_NAME_MAP } from '@shared/ReceiptConfig';
import { colorDotMap, nameMap } from '@shared/CommonConfig';
import { customExpandIcon, cascaderOpt } from '@shared/CommonFun';
import PopoverTip from '@components/PopoverTip';
import EpIcon from '@components/EpIcon';
import MyIcon from '@components/MyIcon';
import DefineDot from '@components/DefineDot';
import TextOverFlow from '@components/TextOverFlow';
import BatchUpdate from '@components/BatchUpdate';
import { getIsGroupRow, getDataByIssueType, getDataByUser } from './TimeBoxFun';
import styles from '../index.less';

const drawerDispatch = 'receipt/saveDrawerIssueId';

function TimeBoxTable({
  issueList: allIssueList,
  filterIssueList,
  viewType,
  dispatch,
  productid,
  getTimeBoxContent,
  totalDwm,
  time
}) {
  let issueList = filterIssueList || [];
  const dataSource = viewType === 'issueType' ? getDataByIssueType(issueList) : getDataByUser(issueList);
  const [expandKeys, setExpandKeys] = useState([]);
  const [selectData, setSelectData] = useState([]);
  const [showCheckbox, setShowCheckbox] = useState(false);

  useEffect(() => {
    setSelectData([]);
    setShowCheckbox(false);
  }, [time]);

  const selectKeys = selectData.map(it => it.issueKey);

  const getAllKeys = () => {
    let hasChildKeys = [];
    allIssueList.forEach(it => {
      if (it.parentIssueKey && allIssueList.some(i => i.issueKey === it.parentIssueKey) && !hasChildKeys.some(i => i === it.parentIssueKey)) {
        hasChildKeys.push(it.parentIssueKey);
      }
    });
    return hasChildKeys;
  };
  let hasChildKeys = getAllKeys();
  const groups = dataSource.map(it => it.issueKey);
  const groupsWithRealChild = [];
  dataSource.forEach(it => {
    if (it.children.some(i => !i.issueKey.includes('empty'))) {
      groupsWithRealChild.push(it.issueKey);
    }
  });
  let allExpandKeys = [];
  let allExpandKeysWithRealChild = hasChildKeys.concat(groupsWithRealChild);
  allExpandKeys = hasChildKeys.concat(groups);

  const columns = [{
    title: () => {
      return (
        <span style={allExpandKeys.length > 0 ? {} : { marginLeft: '26px' }}>
          {
            !!allIssueList.length &&
            <span>
              {
                allExpandKeys.length === expandKeys.length ?
                  <MyIcon type="icon-kuozhananniu" className="f-fs3 u-mgr10 f-csp" style={{ position: 'relative', top: '1px' }} onClick={() => setExpandKeys([])} />
                  :
                  <MyIcon type="icon-shousuoanniu" className="f-fs3 u-mgr10 f-csp" style={{ position: 'relative', top: '1px' }} onClick={() => setExpandKeys(allExpandKeys)} />
              }
            </span>
          }
            标题
        </span>
      );
    },
    dataIndex: 'name',
    width: '25vw',
    render: (text, record) => {
      return getIsGroupRow(record) && !record.issueKey.includes('empty')
        ?
        <span>
          <span>
            {
              viewType !== 'issueType' ?
                <span>{record.name}({record.email})</span>
                :
                <span>
                  {text}
                </span>
            }
            <span className={styles.titleHour}>
              总工作量：{calculateDwm(record.estimate || 0)}人天（已完成/未完成：{calculateDwm(record.close || 0)}/{calculateDwm(record.estimate - record.close)}）
            </span>
          </span>
        </span>
        :
        <span>
          <EpIcon type={ISSUE_TYPE_NAME_MAP[record.issueType]} className="u-mgr5" />
          <TextOverFlow content={text} maxWidth={'20vw'} />
        </span>;
    }
  }, {
    title: '状态',
    dataIndex: 'state',
    width: 120,
    render: (text, record) => {
      return !getIsGroupRow(record) && <DefineDot
        text={text}
        statusMap={nameMap[ISSUE_TYPE_NAME_MAP[record.issueType]]}
        statusColor={colorDotMap[ISSUE_TYPE_NAME_MAP[record.issueType]]}
      />;
    }
  }, {
    title: () => {
      return <span style={{ position: 'relative', top: '-4px' }}>
        <span>完成时间</span>
        <PopoverTip
          trigger={<MyIcon type="icon-tishi" className={styles.tip} />}
          content={<span>到期日/预计上线时间</span>}
        />
      </span>;
    },
    dataIndex: 'expectReleaseTime',
    width: 120,
    render: (text, record) => {
      return <span>{!getIsGroupRow(record) && text ? moment(text).format('YYYY-MM-DD') : '--'}</span>;
    }
  }, {
    title: '版本',
    dataIndex: 'versionVO',
    width: '15vw',
    render: (text, record) => {
      return !getIsGroupRow(record) &&
        <span>
          {text ? <TextOverFlow content={text.name} maxWidth={'15vw'} /> : '-'}
        </span>;
    }
  }, {
    title: '负责人',
    dataIndex: 'responseUser',
    width: 100,
    render: (text, record) => {
      return !getIsGroupRow(record) && <span>{text ? text.name : '-'}</span>;
    }
  }, {
    title: '预估工作量',
    dataIndex: 'dwManpower',
    width: 120,
    render: (text, record) => {
      const estimate = text && text.estimate ? text.estimate : 0;
      return !getIsGroupRow(record) && <span>{estimate ? `${calculateDwm(estimate)}人天` : '--'}</span>;
    }
  }];

  useDeepCompareEffect(() => {
    setExpandKeys(allExpandKeysWithRealChild);
  }, [allExpandKeysWithRealChild]);

  const handleRowExpand = (flag, record) => {
    let newExpandKeys = [...expandKeys];
    if (flag) {
      newExpandKeys.push(record.issueKey);
    } else {
      newExpandKeys = newExpandKeys.filter(i => i !== record.issueKey);
    }
    setExpandKeys(newExpandKeys);
  };

  return (<div className={styles.timeBoxTable}>
    {
      issueList.length ?
        <span>
          <Table
            rowKey={record => record.issueKey}
            columns={columns}
            dataSource={dataSource}
            expandIcon={(props) => customExpandIcon(props)}
            expandedRowKeys={expandKeys}
            onExpand={(flag, record) => handleRowExpand(flag, record)}
            pagination={false}
            scroll={{ y: "calc(100vh - 400px)" }}
            onRow={(record) => {
              return {
                className: record.issueKey && !record.issueKey.includes('group') && 'f-csp',
                onClick: () => {
                  if (record.issueKey && !record.issueKey.includes('group')) {
                    drawerDelayFun(() => {
                      dispatch({ type: drawerDispatch, payload: record.issueKey });
                    }, 200);
                  }
                }
              };
            }}
            rowSelection={showCheckbox ? {
              selectedRowKeys: selectKeys,
              hideDefaultSelections: true,
              columnTitle: ' ',
              onSelect: (data, selected) => {
                const newSelectData = cascaderOpt(data, selected, selectData);
                setSelectData(newSelectData);
              },
              getCheckboxProps: (record) => {
                return {
                  disabled: record.issueKey.includes('group')
                };
              }
            } : null}
          />
          <div className={`f-jcsb-aic u-mgt10 ${styles.batchUpdate}`}>
            <span>
              {
                !showCheckbox &&
                <span className="u-mgl15">
                  共{filterIssueList.length}个
                </span>
              }
              {
                showCheckbox &&
                <span className="u-mgl25">
                  <Checkbox
                    onClick={(e) => setSelectData(e.target.checked ? filterIssueList : [])}
                    checked={filterIssueList.length === selectData.length}
                  ></Checkbox>
                  <span className="u-mgr10 u-mgl10">
                    已选择
                    <span>{selectData.length}</span>项
                  </span>
                  {
                    !!selectData.length &&
                    <BatchUpdate
                      data={selectData}
                      productId={productid}
                      refreshFun={() => {
                        getTimeBoxContent();
                        setSelectData([]);
                      }}
                    />
                  }
                </span>
              }
              <span className={styles.titleHour} style={{ fontSize: '14px' }}>
                总工作量：{calculateDwm(totalDwm.estimate)}人天（已完成/未完成：{calculateDwm(totalDwm.close || 0)}/{calculateDwm(totalDwm.estimate - totalDwm.close)}）
              </span>
            </span>
            <span>
              {
                showCheckbox ?
                  <Button onClick={() => { setShowCheckbox(false); setSelectData([]) }}>取消操作</Button>
                  :
                  <Button onClick={() => setShowCheckbox(true)}>批量操作</Button>
              }
            </span>
          </div>
        </span>
        :
        <Empty className={styles.empty} />
    }
  </div>);
}

export default TimeBoxTable;
