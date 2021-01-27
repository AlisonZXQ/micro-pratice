import React, { Component } from 'react';
import { Table, Tag } from 'antd';
import uuid from 'uuid';
import DefineDot from '@components/DefineDot';
import MyIcon from '@components/MyIcon';
import { aimType, aimMap } from '../../../shared/commonConfig';
import { aimColorDotMap, aimNameMap } from '@shared/CommonConfig';
import { getDisplayCustomField, getDiffData, getCustomStyle } from './components/AimListFun';
import DescriptionModal from './components/DescriptionModal';
import CustomDiffText from '../diff_display/CommonDiffText';

const nochange = 'ZXQ-nochange';
class AimList extends Component {
  state = {};

  columns = [{
    title: <span style={{ position: 'relative', left: '-15px' }}>目标</span>,
    dataIndex: 'summary',
    width: '300px',
    render: (text, record) => {
      const { changeData } = this.props;
      const flag = changeData.some(it => it.summary === record.summary && (it.action === 'create' || it.action === "select"));

      return (text ?
        <span style={{ whiteSpace: 'pre-line' }}>
          {
            flag && <Tag className="u-mgr20">新增</Tag>
          }
          <a
            href={`/v2/my_workbench/objectivedetail/Objective-${record.objectiveId}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <CustomDiffText
              newvalue={<span style={{ position: 'relative', left: '-15px', ...this.getStyle(record, 'summary') }}>
                {text}
              </span>}
              oldvalue={this.getOldValue(record, 'summary')}
            />
          </a>
        </span>
        : '-');
    }
  }, {
    title: '状态',
    dataIndex: 'objectiveStatus',
    width: '100px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<div style={this.getStyle(record, 'objectiveStatus')}>
            {
              text ?
                <DefineDot
                  text={Number(text)}
                  statusColor={aimColorDotMap}
                  statusMap={aimNameMap}
                />
                : '-'
            }
          </div>}
          oldvalue={
            this.getOldValue(record, 'objectiveStatus') === '-' ? '-' :
              this.getOldValue(record, 'objectiveStatus') !== nochange ?
                <DefineDot
                  text={Number(this.getOldValue(record, 'objectiveStatus'))}
                  statusColor={aimColorDotMap}
                  statusMap={aimNameMap}
                /> : nochange
          }
        />
      );
    }
  }, {
    title: '产品',
    dataIndex: 'product',
    width: '150px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<span style={this.getStyle(record, 'product')}>
            {(text && text.name) ? text.name : '-'}
          </span>}
          oldvalue={this.getOldValue(record, 'product')}
        />
      );
    }
  }, {
    title: '子产品',
    dataIndex: 'subProductVO',
    width: '150px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<span style={this.getStyle(record, 'subProductId')}>
            {(text && text.subProductName) ? text.subProductName : '-'}
          </span>}
          oldvalue={this.getOldValue(record, 'subProductVO')}
        />
      );
    }
  }, {
    title: '优先级',
    dataIndex: 'priorityValue',
    width: '100px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<span style={this.getStyle(record, 'priorityValue')}>
            {text ? aimMap[Number(text)] : '-'}
          </span>}
          oldvalue={this.getOldValue(record, 'priorityValue') === nochange
            ? nochange : aimMap[Number(this.getOldValue(record, 'priorityValue'))]
          }
        />
      );
    }
  }, {
    title: '到期日',
    dataIndex: 'dueDate',
    width: '100px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<span style={this.getStyle(record, 'dueDate')}>
            {text ? text : '-'}
          </span>}
          oldvalue={this.getOldValue(record, 'dueDate')}
        />
      );
    }
  }, {
    title: '负责人',
    dataIndex: 'assigneeUser',
    width: '100px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<span style={this.getStyle(record, 'assigneeUser')}>
            {(text && text.name) ? text.name : '-'}
          </span>}
          oldvalue={this.getOldValue(record, 'assigneeUser')}
        />
      );
    }
  }, {
    title: '验收人',
    dataIndex: 'verifierUser',
    width: '100px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<span style={this.getStyle(record, 'verifierUser')}>
            {(text && text.name) ? text.name : '-'}
          </span>}
          oldvalue={this.getOldValue(record, 'verifierUser')}
        />
      );
    }
  }, {
    key: 'type',
    title: '目标类型',
    dataIndex: 'type',
    width: '100px',
    render: (text, record) => {
      return (
        <CustomDiffText
          newvalue={<span style={this.getStyle(record, 'type')}>
            {text ? aimType[text] : '-'}
          </span>}
          oldvalue={this.getOldValue(record, 'type') === nochange
            ? nochange : aimType[Number(this.getOldValue(record, 'type'))]}
        />
      );
    }
  }, {
    title: '验收标准',
    dataIndex: 'description',
    render: (text, record) => {
      return (
        text ?
          <span style={this.getStyle(record, 'description')}>
            <DescriptionModal newvalue={text} oldvalue={this.getOldValue(record, 'description')} name={'验收标准'} />
          </span>
          : '-');
    }
  }, {
    title: '描述',
    dataIndex: 'remark',
    render: (text, record) => {
      return (
        text ?
          <span style={this.getStyle(record, 'remark')}>
            <DescriptionModal newvalue={text} oldvalue={this.getOldValue(record, 'remark')} name={'描述'} />
          </span>
          : '-');
    }
  }];

  getStyle = (record, dataIndex) => {
    const { changeData } = this.props;

    // 1.新增 2.名称一样 高亮
    if (changeData.some(it => it.summary === record.summary && it.action === 'create')) {
      return {
        borderBottom: '2px #FFAE00 solid',
      };
    }

    const obj = changeData.find(it => it.issueKey === record.issueKey) || {};

    if (Object.keys(obj).length === 0) return null;

    if (obj.action === 'delete') {
      return {
        borderBottom: '2px #FFAE00 solid',
        textDecoration: 'line-through'
      };
    } else if ((obj.action === 'create' || obj.action === 'select') ||
      (obj.action === 'update' && obj[dataIndex] && !dataIndex.includes('custom'))) {
      return {
        borderBottom: '2px #FFAE00 solid',
      };
    } else if (obj.action === 'update' && dataIndex.includes('custom')) {
      const id = Number(dataIndex.split('-')[1]);
      if (obj.diffCustom && obj.diffCustom.some(it => it.productCustomField && it.productCustomField.id === id)) {
        return {
          borderBottom: '2px #FFAE00 solid',
        };
      }
    }
  };

  isEmpty = (text) => {
    return text ? text : '-';
  };

  getOldValue = (record, type) => {
    const { oldObjectives, changeData } = this.props;
    const newKey = record.issueKey;
    const oldObj = oldObjectives.find(it => it.issueKey === newKey) || {};

    // 删除的直接返回nochange
    if ((record.action && record.action === 'delete')) {
      return nochange;
    }

    // 新增的
    if (!Object.keys(oldObj).length) {
      return '-';
    }

    // 没有任何变化的
    if (!!Object.keys(oldObj).length && !changeData.some(it => it.issueKey === record.issueKey)) {
      return nochange;
    }

    // 编辑更新的
    if (type === 'product' || type === 'assigneeUser' || type === 'verifierUser') {
      if (record[type] && oldObj[type] && record[type].name !== oldObj[type].name) {
        return oldObj[type].name || nochange;
      } else {
        return nochange;
      }
    } else if (type === 'subProductVO') {
      if (record[type] && oldObj[type] && record[type].subProductName !== oldObj[type].subProductName) {
        return oldObj[type].subProductName || nochange;
      } else {
        return nochange;
      }
    } else if (record[type] && oldObj[type] && record[type] !== oldObj[type]) {
      return oldObj[type] || nochange;
    } else {
      return nochange;
    }
  }

  customExpandIcon = (props) => {
    const { oldObjectives } = this.props;
    const oldObjectivesArr = oldObjectives || [];
    const oldObjectiveObj = oldObjectivesArr.find(it => it.issueKey === props.record.issueKey) || {};

    const newData = getDisplayCustomField(props.record);
    const oldData = getDisplayCustomField(oldObjectiveObj);
    const diffData = getDiffData(newData, oldData);

    if (diffData.length > 0) {
      if (props.expanded) {
        return (
          <a
            style={{ color: 'inherit' }}
            onClick={e => { props.onExpand(props.record, e) }}
          >
            <MyIcon type="icon-kuozhananniu" className="f-fs3" style={{ position: 'relative', top: '1px' }} />
          </a>);
      } else {
        return (
          <a
            style={{ color: 'inherit' }}
            onClick={e => { props.onExpand(props.record, e) }}
          >
            <MyIcon type="icon-shousuoanniu" className="f-fs3" style={{ position: 'relative', top: '1px' }} />
          </a>);
      }
    } else {
      return (<span style={{ marginRight: 8 }}></span>);
    }
  };

  getDiffCom = (it) => {
    switch (it.action) {
      case 'add':
        return (<CustomDiffText
          newvalue={it.changeData}
          oldvalue={'-'}
        />);
      case 'update':
        return (<CustomDiffText
          newvalue={it.changeData}
          oldvalue={it.oldData && it.oldData.changeData}
        />);
      case 'delete':
        return (<CustomDiffText
          newvalue={it.changeData}
          oldvalue={it.changeData}
        />);
      default:
        return it.changeData;
    }
  }

  render() {
    const { objectives, changeData, oldObjectives } = this.props;
    const data = changeData.filter(it => it.action === 'delete') || [];
    const dataSource = objectives && objectives.concat(data);

    return (
      <Table
        key={uuid()}
        rowKey={record => record.objectiveId}
        columns={this.columns}
        dataSource={dataSource}
        pagination={false}
        size="middle"
        expandedRowRender={(record) => {
          const oldObjectivesArr = oldObjectives || [];
          const oldObjectiveObj = oldObjectivesArr.find(it => it.issueKey === record.issueKey) || {};

          const newData = getDisplayCustomField(record);
          const oldData = getDisplayCustomField(oldObjectiveObj);

          const diffData = getDiffData(newData, oldData);

          return diffData && diffData.length ? diffData.map(it =>
            <div className="u-mgb5">
              <span className="u-title">{it.name}：</span>
              <span className="u-subtitle" style={{ whiteSpace: 'pre-line' }}>
                <span style={getCustomStyle(it)}>
                  {this.getDiffCom(it)}
                </span>
              </span>
            </div>) : '-';
        }}
        defaultExpandedRowKeys={dataSource && dataSource.map(it => it.objectiveCustomFieldRelationInfoList && !!it.objectiveCustomFieldRelationInfoList.length && it.objectiveId)}
        expandIcon={(props) => this.customExpandIcon(props)}
      />);
  }
}

export default AimList;
