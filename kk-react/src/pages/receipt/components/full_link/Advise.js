import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table, message } from 'antd';
import { connect } from 'dva';
import EpIcon from '@components/EpIcon';
import DefineDot from '@components/DefineDot';
import EpIssueList from '@pages/receipt/components/ep_issue_list';
import { connTypeMap, connTypeIdMap, LEVER_COLOR, LEVER_ICON, LEVER_NAME } from '@shared/ReceiptConfig';
import { adviseNameMap, adviseColorDotMap } from '@shared/CommonConfig';
import { deleteIssueRelationId } from '@services/receipt';
import { warnModal } from '@shared/CommonFun';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

class Advise extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.columns = [{
      title: '建议名称',
      dataIndex: 'name',
      render: (text, record) => {
        const { drawerIssueId } = this.props;
        return (
          <a
            className='f-ait'
            href={`/v2/my_workbench/advisedetail/Feedback-${record.id}`} target="_blank" rel="noopener noreferrer">
            <EpIcon type="建议" className='u-pdt5' />
            <span className="u-mgl10 f-ib" style={{ width: drawerIssueId ? '200px' : '60vw' }}>
              {record.name}
            </span>
          </a>
        );
      }
    }, {
      title: '状态',
      dataIndex: 'state',
      render: (text, record) => {
        return (<div>
          <DefineDot
            text={record.state}
            statusMap={adviseNameMap}
            statusColor={adviseColorDotMap}
          />
        </div>);
      }
    }, {
      title: '优先级',
      dataIndex: 'level',
      render: (text, record) => {
        return text ? <div style={{ width: '50px' }}>
          <MyIcon type={LEVER_ICON[text]} className="f-fs3 u-mgr5" />
          <span style={{ color: LEVER_COLOR[text] }}>{LEVER_NAME[text]}</span>
        </div> : '--';
      }
    }];
    this.diffColumns = [{
      title: '操作',
      dataIndex: 'caozuo',
      render: (text, record) => {
        return <a onClick={() => this.handleDelete(record)}>
          <MyIcon type='icon-quxiaoguanlian' className={styles.operateIcon} />
        </a>;
      }
    }];
  }

  componentDidMount() {
  }

  getFullLink = () => {
    const { issueType, parentIssueId } = this.props;
    const params = {
      type: connTypeMap[issueType],
      id: this.props.location.query[connTypeIdMap[issueType]] || parentIssueId,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  handleDelete = (record) => {
    const id = record.issueRelationId;

    warnModal({
      title: `您确认取消关联吗?`,
      okCallback: () => {
        deleteIssueRelationId(id).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('关系解除成功！');
          this.getFullLink();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getButtons = () => {
    const { issueType, parentIssueId } = this.props;

    // issueType当前查询的单据类型，parentIssueType父单据的查询类型
    if (issueType === 'requirement') {
      return (<EpIssueList {...this.props} issueType="advise" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />);
    } else {
      return null;
    }
  }

  render() {
    const { dataSource } = this.props;
    const tableColumns = [...this.columns, ...this.diffColumns];

    return (<span>
      {!!dataSource.length &&
        <Table
          columns={tableColumns}
          className={`u-mgl10 u-mgt10 ${styles.table}`}
          dataSource={dataSource}
          pagination={dataSource.length > 10 ? true : false}
          showHeader={false}
        />
      }

      {
        <div className="u-mgb10 u-mgt10 u-pdl10">
          {
            this.getButtons()
          }
        </div>
      }

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    requirementDetail: state.requirement.requirementDetail,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default withRouter(connect(mapStateToProps)(Advise));
