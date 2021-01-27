import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Button, message, Modal } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import DefineDot from '@components/DefineDot';
import EpIcon from '@components/EpIcon';
import CreateTaskForm from '@components/CreateIssues/create_task';
import BatchCreateTask from '@pages/receipt/components/batch_create_task';
import EpIssueList from '@pages/receipt/components/ep_issue_list';
import BusinessHOC from '@components/BusinessHOC';
import { bugTaskNameMap, bugTaskColorDotMap } from '@shared/CommonConfig';
import { deleteTaskItem } from '@services/task';
import { create4RelationIssue, deleteIssueRelationId } from '@services/receipt';
import { connTypeMap, connTypeIdMap, ISSUE_TYPE_JIRA_MAP, LEVER_ICON, LEVER_COLOR, LEVER_NAME } from '@shared/ReceiptConfig';
import { getIssueCustom, getMentionUsers } from '@utils/helper';
import { deleteModal, warnModal } from '@shared/CommonFun';
import MyIcon from '@components/MyIcon';
import { FST_TYPE_MAP } from '@shared/ProductSettingConfig';
import DesignForm from '../../requirement/design';
import styles from './index.less';

class Task extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      createVisible: false,
      type: '', // 操作类别
      loading: false,
    };

    this.columns = [{
      title: '任务名称',
      dataIndex: 'name',
      render: (text, record) => {
        const { drawerIssueId } = this.props;
        return (
          <a
            className='f-ait'
            href={`/v2/my_workbench/taskdetail/Task-${record.id}`} target="_blank" rel="noopener noreferrer">
            <EpIcon type="任务" className='u-pdt5' />
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
        return (<div style={{ minWidth: '80px' }}>
          <DefineDot
            text={record.state}
            statusMap={bugTaskNameMap}
            statusColor={bugTaskColorDotMap}
          />
        </div>);
      }
    }, {
      title: '优先级',
      dataIndex: 'level',
      render: (text, record) => {
        return text ? <div style={{ width: '50px' }}>
          <MyIcon type={LEVER_ICON[text]} className="f-fs3 u-mgr5" />
          <span style={{ color: LEVER_COLOR[text]}}>{LEVER_NAME[text]}</span>
        </div> : '--';
      }
    }];

    this.diffColumns = [{
      title: '操作',
      dataIndex: 'caozuo',
      width: '200px',
      render: (text, record) => {
        const { issueType } = this.props;
        return <span>
          {
            issueType !== 'subTask' ?
              <span className='f-ib' style={{ width: '100%' }}>
                {
                  issueType === 'requirement' &&
                  <a onClick={() => this.handleDelete(record)} className="delColor">
                    <MyIcon type='icon-shanchu' className={`${styles.operateIcon} u-mgl10`} />
                  </a>
                }
                <a onClick={() => this.handleRemove(record)}>
                  <MyIcon type='icon-quxiaoguanlian' className={styles.operateIcon} />
                </a>
              </span>
              : '-'
          }

        </span>;
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
    const id = record.id;

    deleteModal({
      title: `您确认删除吗？`,
      okCallback: () => {
        deleteTaskItem({ id }).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除成功！');
          this.getFullLink();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handleRemove = (record) => {
    const id = record.issueRelationId;
    warnModal({
      title: `您确认取消关联吗？`,
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
    const { issueType, requirementDetail, isBusiness, parentIssueId, lastProduct } = this.props;
    const subProduct = requirementDetail.subproduct || {};
    // 1按Task, 2按SubTask
    const fstType = subProduct.fstType;

    switch (issueType) {
      case 'objective':
      case 'ticket':
        return (<span>
          <Button type="dashed" className="u-mgr10" onClick={() => this.setState({ createVisible: true, type: 'create' })}>创建任务</Button>
          <EpIssueList {...this.props} issueType="task" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />
        </span>);
      case 'requirement':
        return (<span>
          <Button type="dashed" className="u-mgr10" onClick={() => this.setState({ createVisible: true, type: 'create' })}>创建任务</Button>
          <BatchCreateTask
            type="requirementDetail"
            handleAdd={this.handleAdd}
            parentIssueId={parentIssueId}
            requirementDetail={requirementDetail}
            lastProduct={lastProduct}
          />
          {
            fstType === FST_TYPE_MAP.TASK &&
            <span>
              {!isBusiness &&
                <Button type="dashed" className="u-mgr10" onClick={() => this.setState({ visible: true })}>创建设计任务</Button>
              }
              <EpIssueList {...this.props} issueType="task" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />
            </span>
          }
        </span>);
      case 'bug':
        return (<EpIssueList {...this.props} issueType="task" type="detail" parentIssueType={issueType} isMulti parentIssueId={parentIssueId} />);
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
        issuetype: ISSUE_TYPE_JIRA_MAP.TASK,
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

  handleAdd = async (currentTask) => {
    // 只有需求下可以批量创建任务
    const { issueType, requirementDetail, objectiveDetail, parentIssueId } = this.props;
    let detail = issueType === 'requirement' ? requirementDetail : objectiveDetail;
    const productid = detail && detail.product && detail.product.id;
    const subProductId = detail && detail.subproduct && detail.subproduct.id;

    this.setState({ loading: true });
    const results = await Promise.allSettled(currentTask.map((it, index) => {
      const params = {
        parentIssueType: connTypeMap[issueType],
        parentIssueId: this.props.location.query[connTypeIdMap[issueType]] || parentIssueId,
        issuetype: ISSUE_TYPE_JIRA_MAP.TASK,
        ...it,
        productid,
        subProductId,
        estimate_cost: '0m',
      };
      return Promise.resolve(create4RelationIssue(params));
    }));
    const successLength = results.filter(it => it.value && it.value.code && it.value.code === 200).length;

    message.success(`批量创建任务完成，成功${successLength}个，失败${results.length - successLength}个`);
    this.getFullLink();
    this.setState({ createVisible: false, loading: false });
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
    const { dataSource, issueType, requirementDetail, objectiveDetail,
      bugDetail, ticketDetail, parentIssueId } = this.props;
    const { visible, createVisible, type, loading } = this.state;
    let productid = 0;
    let subProductId = 0;
    let parentData = {};
    if (issueType === 'requirement') {
      productid = requirementDetail.product && requirementDetail.product.id;
      subProductId = requirementDetail.subproduct && requirementDetail.subproduct.id;
      parentData.version = requirementDetail.version || {};
    } else if (issueType === 'objective') {
      productid = objectiveDetail.product && objectiveDetail.product.id;
      subProductId = objectiveDetail.subproduct && objectiveDetail.subproduct.id;
    } else if (issueType === 'bug') {
      productid = bugDetail.product && bugDetail.product.id;
      subProductId = bugDetail.subproduct && bugDetail.subproduct.id;
    } else if (issueType === 'ticket') {
      productid = ticketDetail.product && ticketDetail.product.id;
      subProductId = ticketDetail.subproduct && ticketDetail.subproduct.id;
    }

    const tableColumns = [...this.columns, ...this.diffColumns];

    return (<span>
      {!!dataSource.length &&
        <Table
          className={`u-mgl10 u-mgt10 ${styles.table}`}
          columns={tableColumns}
          dataSource={dataSource}
          pagination={dataSource.length > 10 ? true : false}
          loading={loading}
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
        title="创建设计任务"
        visible={visible}
        width={1000}
        bodyStyle={{ padding: '0px' }}
        onCancel={() => this.setState({ visible: false })}
        footer={null}
        destroyOnClose
        maskClosable={false}
        okButtonProps={{ loading }}
      >
        <DesignForm
          closeModal={() => this.setState({ visible: false })}
          issueType={issueType}
          parentIssueId={parentIssueId}
        />
      </Modal>

      <Modal
        title={'创建任务'}
        visible={createVisible}
        onCancel={() => { this.setState({ createVisible: false }); this.props.form.resetFields() }}
        onOk={() => this.handelOk()}
        className='modal-createissue-height'
        width={1000}
        maskClosable={false}
        okButtonProps={{ loading }}
      >
        {
          type === 'create' && <CreateTaskForm {...this.props} productid={productid} subProductId={subProductId} parentData={parentData} />
        }

      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    requirementDetail: state.requirement.requirementDetail,
    objectiveDetail: state.objective.objectiveDetail,
    bugDetail: state.bug.bugDetail,
    ticketDetail: state.ticket.ticketDetail,
    customSelect: state.aimEP.customSelect,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default BusinessHOC()(withRouter(connect(mapStateToProps)(Form.create()(Task))));
