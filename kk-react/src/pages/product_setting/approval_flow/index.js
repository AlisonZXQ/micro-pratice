import React, { Component } from 'react';
import { Button, Table, message, Popover, Card, Divider } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import { history } from 'umi';
import { workFlowList, isEnable, isDisable, dltWorkFlow, copyWorkFlow } from '@services/approvalflow';
import { deleteModal } from '@shared/CommonFun';
import { flowType } from '@shared/ProductSettingConfig';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      productId: null,
    };
    this.columns = [
      {
        title: '名称',
        dataIndex: 'workflowName',
        key: 'workflowName',
        width: '20vw',
        render: (text, record) => {
          return <Popover content={<span>{text}</span>} trigger="hover">
            <div className='f-toe' style={{ width: '20vw' }}>{text}</div>
          </Popover>;
        }
      },
      {
        title: '类型',
        dataIndex: 'workflowType',
        key: 'workflowType',
        render: (text, record) => {
          return (flowType[text]);
        }
      },
      {
        title: '关联模板',
        dataIndex: 'projectTemplateVOList',
        key: 'projectTemplateVOList',
        render: (text, record, index) => {
          return text && text.length > 0 ? text.map(it => it.name).join('，') : '--';
          // return (
          //   <Switch
          //     checkedChildren="开"
          //     unCheckedChildren="关"
          //     checked={text === 1}
          //     onChange={(checked) => { this.changeState(checked, record, index) }}
          //   />
          // );
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        width: 160,
        render: (text, record) => {
          return (
            <span>
              <Link onClick={() => this.copy(record)}>复制</Link>
              <Divider type="vertical" />
              <a onClick={() => { this.routeChange('edit', record.id) }}>编辑</a>
              <Divider type="vertical" />
              <Link className='delColor' onClick={() => this.dlt(record)}>删除</Link>
            </span>
          );
        }
      },
    ];
  }

  componentDidMount() {
    const { lastProduct } = this.props;
    if (lastProduct && lastProduct.id) {
      const id = lastProduct.id;
      this.setState({ productId: id });
      this.getFlowList(id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const beforeId = this.props.lastProduct.id;
    const nextId = nextProps.lastProduct.id;

    if (beforeId !== nextId) {
      const id = nextId;
      this.setState({ productId: id });
      this.getFlowList(id);
    }
  }

  getFlowList = (id) => {
    const params = {
      productId: this.state.productId || id
    };
    this.setState({ loading: true });
    workFlowList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询审批流列表失败, ${res.msg}`);
      }
      this.setState({ loading: false });
      this.setState({ data: res.result });
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`查询审批流列表异常, ${err || err.message}`);
    });
  }

  changeState = (checked, record, index) => {
    const params = {
      id: record.id,
    };
    if (checked) {
      isEnable(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`开启失败, ${res.msg}`);
        }
        message.success(`开启成功`);
        this.getFlowList();
      }).catch((err) => {
        return message.error(`开启异常, ${err || err.message}`);
      });
    } else {
      isDisable(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`关闭失败, ${res.msg}`);
        }
        message.success(`关闭成功`);
        this.getFlowList();
      }).catch((err) => {
        return message.error(`关闭异常, ${err || err.message}`);
      });
    }
  }

  dlt(record) {
    const params = {
      id: record.id,
    };
    deleteModal({
      title: '确认删除？',
      content: '该操作将无法撤销，若该类型流程无生效配置项则操作默认不需审批直接生效',
      okCallback: () => {
        dltWorkFlow(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`删除失败, ${res.msg}`);
          }
          message.success(`删除成功`);
          this.getFlowList();
        }).catch((err) => {
          return message.error(`删除异常, ${err || err.message}`);
        });
      }
    });
  }

  copy(record) {
    const params = {
      id: record.id,
    };
    copyWorkFlow(params).then((res) => {
      message.loading('对象复制中，请稍后');
      if (res.code !== 200) {
        message.destroy();
        return message.error(`复制失败, ${res.msg}`);
      }
      message.destroy();
      message.success(`复制成功`);
      this.getFlowList();
    }).catch((err) => {
      message.destroy();
      return message.error(`复制异常, ${err || err.message}`);
    });
  }

  routeChange = (type, text) => {
    const { productId } = this.state;
    history.push(`/product_setting/approval_flow/af_create?type=${type}&productId=${productId}&id=${text}`);
    if (type === 'new') {
      this.props.dispatch({ type: 'approvalflow/saveFlowData', payload: {} });
      this.props.dispatch({ type: 'approvalflow/currentNode', payload: 0 });
    }
  }

  callbackProduct = (value) => {
    this.setState({ productId: value }, () => {
      this.getFlowList();
    });
  }

  render() {
    const { lastProduct } = this.props;
    const { data, loading, productId } = this.state;

    return ([
      <div className='settingTitle'>
        {lastProduct.name}-模板列表
      </div>,
      <div style={{ padding: '0px 20px 20px 20px' }}>

        <div className='bbTitle f-jcsb-aic'>
          <span className='name'>审批流配置({lastProduct.name})</span>
          <span>
            <Button className='u-mgr20' onClick={() => history.push(`/product_setting/template?productid=${lastProduct && lastProduct.id}`)}>返回模板列表</Button>
            <Button
              disabled={!productId}
              type="primary"
              onClick={() => { this.routeChange('new', '') }}>
              新建流程
            </Button>
          </span>
        </div>
        <Card className="cardBottomNone">
          <Table
            // className='bgWhiteModel'
            dataSource={data}
            columns={this.columns}
            loading={loading}
          />
        </Card>

      </div>]);
  }
}

const mapStateToProps = (state) => {
  return {
    flowData: state.approvalflow.flowData,
    currentNode: state.approvalflow.currentNode,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(index);
