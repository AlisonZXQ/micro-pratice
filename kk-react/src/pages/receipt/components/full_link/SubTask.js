import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Button, message, Modal } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import DefineDot from '@components/DefineDot';
import EpIcon from '@components/EpIcon';
import { deleteTaskItem } from '@services/task';
import CreateTaskForm from '@components/CreateIssues/create_task';
import { bugTaskNameMap, bugTaskColorDotMap } from '@shared/CommonConfig';
import { connTypeMap, connTypeIdMap, ISSUE_TYPE_JIRA_MAP, LEVER_COLOR, LEVER_NAME, LEVER_ICON } from '@shared/ReceiptConfig';
import { create4RelationIssue } from '@services/receipt';
import { getIssueCustom, getMentionUsers } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { deleteModal } from '@shared/CommonFun';
import styles from './index.less';

class SubTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
    };

    this.columns = [{
      title: '子任务名称',
      dataIndex: 'name',
      render: (text, record) => {
        const { drawerIssueId } = this.props;
        return (
          <a
            className='f-ait'
            href={`/v2/my_workbench/taskdetail/Subtask-${record.id}/?subTaskId=1`} target="_blank" rel="noopener noreferrer">
            <EpIcon type="子任务" className='u-pdt5' />
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
      render: (text, record) => {
        return <a onClick={() => this.handleDelete(record)} className="delColor">
          <MyIcon type='icon-shanchu' className={styles.operateIcon} />
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

  getButtons = () => {
    const { issueType } = this.props;
    if (issueType === 'task') {
      return ([
        <Button type="dashed" className="u-mgr10" onClick={() => this.setState({ createVisible: true, type: 'create' })}>创建子任务</Button>
      ]);
    } else {
      return null;
    }
  }

  getSelectValue = (id, valueId) => {
    if (valueId) {
      const { customSelect } = this.props;
      const arr = customSelect ? customSelect[id] : [];
      const obj = arr.find(it => it.id === Number(valueId));
      return obj && obj.customvalue;
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
        issuetype: ISSUE_TYPE_JIRA_MAP.SUBTASK,
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
        this.setState({ createVisible: false });
        this.props.form.resetFields();
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  render() {
    const { dataSource, taskDetail } = this.props;
    const { createVisible, type, loading } = this.state;
    const task = taskDetail.task || {};
    const productid = taskDetail.product && taskDetail.product.id;
    const tableColumns = [...this.columns, ...this.diffColumns];

    return (<span>
      {!!dataSource.length &&
        <Table
          className={`u-mgl10 u-mgt10 ${styles.table}`}
          columns={tableColumns}
          dataSource={dataSource}
          pagination={false}
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
        title={'创建子任务'}
        visible={createVisible}
        onCancel={() => { this.setState({ createVisible: false }); this.props.form.resetFields() }}
        onOk={() => this.handelOk()}
        width={1000}
        className='modal-createissue-height'
        destroyOnClose
        maskClosable={false}
        okButtonProps={{ loading }}
      >
        {
          type === 'create' &&
          <CreateTaskForm
            {...this.props}
            createType="childtask"
            parentData={task}
            productid={productid}
          />
        }

      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    taskDetail: state.task.taskDetail,
    customSelect: state.aimEP.customSelect,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(SubTask)));
