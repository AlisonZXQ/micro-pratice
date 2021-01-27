import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, message, Button, Modal } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import EpIcon from '@components/EpIcon';
import CreateBugForm from '@components/CreateIssues/create_bug';
import DefineDot from '@components/DefineDot';
import EpIssueList from '@pages/receipt/components/ep_issue_list';
import { getIssueCustom, getMentionUsers } from '@utils/helper';
import { bugTaskColorDotMap, bugTaskNameMap } from '@shared/CommonConfig';
import { deleteIssueRelationId, create4RelationIssue } from '@services/receipt';
import { connTypeMap, connTypeIdMap, ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import { levelMap } from '@shared/BugConfig';
import { warnModal } from '@shared/CommonFun';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

class Bug extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createVisible: false,
      loading: false,
    };
    this.columns = [{
      title: '缺陷名称',
      dataIndex: 'name',
      render: (text, record) => {
        const { drawerIssueId } = this.props;

        return (
          <a
            className='f-ait'
            href={`/v2/my_workbench/bugdetail/Bug-${record.id}`} target="_blank" rel="noopener noreferrer">
            <EpIcon type="缺陷" className='u-pdt5' />
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
            statusMap={bugTaskNameMap}
            statusColor={bugTaskColorDotMap}
          />
        </div>);
      }
    }, {
      title: '严重程度',
      dataIndex: 'level',
      render: (text, record) => {
        const item = levelMap.find(it => it.id === text);
        return <span>
          <MyIcon type="icon-jinjichengdu" className="u-primary f-fs3 u-mgr5" />
          {item ? item.name : '--'}
        </span>;
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

    switch (issueType) {
      case 'requirement':
      case 'task':
        // case 'ticket':
        return ([<EpIssueList {...this.props} issueType="bug" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />]);
      case 'ticket':
        return <span>
          <Button type="dashed" className="u-mgr10" onClick={() => this.setState({ createVisible: true })}>创建缺陷</Button>
          <EpIssueList {...this.props} issueType="bug" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />
        </span>;
      default: return null;
    }
  }

  handelOk = () => {
    const { issueType, customSelect, parentIssueId } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect);

      const params = {
        parentIssueType: connTypeMap[issueType],
        parentIssueId: this.props.location.query[connTypeIdMap[issueType]] || parentIssueId,
        issuetype: ISSUE_TYPE_JIRA_MAP.BUG,
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };

      this.setState({ loading: true });
      this.create4RelationIssue(params, true);
    });
  }

  create4RelationIssue = (params) => {
    create4RelationIssue(params).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
      this.setState({ createVisible: false });
      this.getFullLink();
      this.props.form.resetFields();
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`新建异常, ${err || err.message}`);
    });
  }

  render() {
    const { dataSource, ticketDetail, issueType } = this.props;
    const { createVisible, loading } = this.state;
    const tableColumns = [...this.columns, ...this.diffColumns];

    let productid = 0;
    let subProductId = 0;
    if (issueType === 'ticket') {
      productid = ticketDetail.product && ticketDetail.product.id;
      subProductId = ticketDetail.subproduct && ticketDetail.subproduct.id;
    }

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

      <Modal
        title={'创建缺陷'}
        visible={createVisible}
        onCancel={() => { this.setState({ createVisible: false }); this.props.form.resetFields() }}
        onOk={() => this.handelOk()}
        width={1000}
        className='modal-createissue-height'
        maskClosable={false}
        okButtonProps={{ loading }}
      >
        {
          <CreateBugForm {...this.props} productid={productid} subProductId={subProductId} />
        }
      </Modal>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    taskDetail: state.task.taskDetail,
    requirementDetail: state.requirement.requirementDetail,
    ticketDetail: state.ticket.ticketDetail,
    customSelect: state.aimEP.customSelect,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(Bug)));
