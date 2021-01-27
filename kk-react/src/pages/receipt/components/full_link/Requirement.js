import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, message, Modal, Button } from 'antd';
import { connect } from 'dva';
import EpIcon from '@components/EpIcon';
import DefineDot from '@components/DefineDot';
import EpIssueList from '@pages/receipt/components/ep_issue_list';
import CreateRequirementForm from '@components/CreateIssues/create_requirement';
import { getIssueCustom, getMentionUsers } from '@utils/helper';
import { requirementNameMap, requirementColorDotMap } from '@shared/CommonConfig';
import { deleteIssueRelationId, create4RelationIssue } from '@services/receipt';
import { connTypeMap, connTypeIdMap, ISSUE_TYPE_JIRA_MAP, LEVER_COLOR, LEVER_ICON, LEVER_NAME } from '@shared/ReceiptConfig';
import MyIcon from '@components/MyIcon';
import { warnModal } from '@shared/CommonFun';
import styles from './index.less';

class Requirement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.columns = [{
      title: '需求名称',
      dataIndex: 'name',
      render: (text, record) => {
        const { drawerIssueId } = this.props;
        return (
          <a
            className='f-ait'
            href={`/v2/my_workbench/requirementdetail/Feature-${record.id}`} target="_blank" rel="noopener noreferrer">
            <EpIcon className='u-pdt5' type="需求" />
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
            statusMap={requirementNameMap}
            statusColor={requirementColorDotMap}
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
      title: `您确认解除关联吗?`,
      okCallback: () => {
        deleteIssueRelationId(id).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('关系解除成功！');
          this.getFullLink();
          if (this.props.refreshFun && typeof this.props.refreshFun === 'function') {
            this.props.refreshFun();
          }
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getButtons = () => {
    const { issueType, fullLinkData, parentIssueId } = this.props;
    const requirementSet = fullLinkData.requirementSet || [];
    const objectiveSet = fullLinkData.objectiveSet || [];

    switch (issueType) {
      case 'bug':
        return (<span>
          <EpIssueList {...this.props} issueType="requirement" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />
        </span>);
      case 'task':
        return (<span>
          {
            !requirementSet.length && !objectiveSet.length &&
            <EpIssueList {...this.props} issueType="requirement" type="detail" parentIssueType={issueType} parentIssueId={parentIssueId} />
          }
        </span>);
      case 'advise':
      case 'objective':
        return (<span>
          <Button type="dashed" className="u-mgr10" onClick={() => this.setState({ createVisible: true, type: 'create' })}>创建需求</Button>
          <EpIssueList {...this.props} issueType="requirement" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />
        </span>);
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
        issuetype: ISSUE_TYPE_JIRA_MAP.REQUIREMENT,
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };

      this.setState({ loading: true });
      create4RelationIssue(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        this.getFullLink();
        this.props.form.resetFields();
        this.setState({ createVisible: false });
        if (this.props.refreshFun && typeof this.props.refreshFun === 'function') {
          this.props.refreshFun();
        }
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  render() {
    const { dataSource, issueType, adviseDetail, objectiveDetail, bugDetail, taskDetail } = this.props;
    const { createVisible, type, loading } = this.state;
    let productid = 0;
    if (issueType === 'objective') {
      productid = objectiveDetail.product && objectiveDetail.product.id;
    } else if (issueType === 'advise') {
      productid = adviseDetail.product && adviseDetail.product.id;
    } else if (issueType === 'bug') {
      productid = bugDetail.product && bugDetail.product.id;
    } else if (issueType === 'task') {
      productid = taskDetail.product && taskDetail.product.id;
    }

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

      <Modal
        title={'创建需求'}
        visible={createVisible}
        onCancel={() => { this.setState({ createVisible: false }); this.props.form.resetFields() }}
        onOk={() => this.handelOk()}
        width={1000}
        className='modal-createissue-height'
        maskClosable={false}
        okButtonProps={{ loading }}
        destroyOnClose
      >
        {
          type === 'create' && <CreateRequirementForm {...this.props} productid={productid} />
        }

      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    fullLinkData: state.receipt.fullLinkData,
    adviseDetail: state.advise.adviseDetail,
    taskDetail: state.task.taskDetail,
    objectiveDetail: state.objective.objectiveDetail,
    bugDetail: state.bug.bugDetail,
    customSelect: state.aimEP.customSelect,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(Requirement)));
