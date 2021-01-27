import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Button, Divider, Modal, message, Spin, Input, Tag } from 'antd';
import { getModuleDetailById, deleteModuleById, addModuleJira, addModuleEP, updateModuleEP } from '@services/product_setting';
import BackToPreview from '@components/BackToPreview';
import BusinessHOC from '@components/BusinessHOC';
import { deleteModal } from '@shared/CommonFun';
import { JIRA_SYNC_USE } from '@shared/ProductSettingConfig';
import ModuleForm from './components/ModuleForm';
import JiraModule from './components/JiraModule';
import ReplaceModule from './components/ReplaceModule';

const JIRA_SYNC_OPEN = `${JIRA_SYNC_USE.OPEN}`;
const isEmpty = (text) => {
  return text ? text : '-';
};

const { Search } = Input;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: '', // create创建 edit编辑
      moduleObj: {},
      name: '', // 模糊查询title
    };

    this.columns = [{
      title: 'jiraid',
      dataIndex: 'jiraid',
      render: (text, record) => {
        return isEmpty(record.productModule && record.productModule.jiraid);
      }
    }, {
      title: '所属子产品',
      dataIndex: 'subProduct',
      render: (text, record) => {
        return isEmpty(text.name);
      }
    }, {
      title: '模块名称',
      dataIndex: 'name',
      render: (text, record) => {
        const { jiraSync } = this.props.location.query;
        return <span>
          {isEmpty(record.productModule && record.productModule.name)}
          {
            !record.jiraExistStatus && jiraSync === JIRA_SYNC_OPEN && <Tag>已在JIRA中删除</Tag>
          }
        </span>;
      }
    }, {
      title: '建议默认负责人',
      dataIndex: 'responseUser',
      render: (text) => {
        return isEmpty(text && text.realname);
      }
    }, {
      title: '建议默认验证人',
      dataIndex: 'adviseRequireUser',
      render: (text) => {
        return isEmpty(text && text.realname);
      }
    }, {
      title: '需求默认负责人',
      dataIndex: 'requirementResponseUser',
      render: (text) => {
        return isEmpty(text && text.realname);
      }
    }, {
      title: '需求默认验证人',
      dataIndex: 'requirementRequireUser',
      render: (text) => {
        return isEmpty(text && text.realname);
      }
    }, {
      title: '操作',
      dataIndex: 'opt',
      render: (text, record) => {
        const { jiraSync } = this.props.location.query;
        const { moduleList, isBusiness } = this.props;

        return <span>
          {
            !record.jiraExistStatus && jiraSync === JIRA_SYNC_OPEN && !isBusiness ?
              <span>
                <ReplaceModule id={record.productModule.id} getModuleList={this.getModuleList} moduleList={moduleList} />
                <Divider type="vertical" />
                <a className="delColor" onClick={() => this.handleDelete(record)}>删除</a>
              </span>
              :
              <span>
                <a onClick={() => this.handleEdit(record.productModule.id)}>编辑</a>
                <Divider type="vertical" />
                <a className="delColor" onClick={() => this.handleDelete(record)}>删除</a>
              </span>
          }
        </span>;
      }
    }];
  }

  componentDidMount() {
    this.getModuleList();
  }

  handleEdit = (id) => {
    this.setState({ visible: true, type: 'edit' });
    getModuleDetailById({ id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ moduleObj: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = (record) => {
    const that = this;
    const { jiraSync } = this.props.location.query;

    deleteModal({
      title: `您确认要删除模块【${record.productModule.name}】吗?`,
      content: <span className="delColor">{jiraSync === JIRA_SYNC_OPEN ? '注意：JIRA上的模块并不会删除！' : ''}</span>,
      okCallback: () => {
        deleteModuleById(record.productModule.id).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('模块删除成功！');
          that.getModuleList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getModuleList = () => {
    const { subProductId } = this.props.location.query;
    this.props.dispatch({ type: 'productSetting/getModuleListById', payload: { subProductId } });
  }

  handleOk = () => {
    const { subProductId } = this.props.location.query;

    const { type, moduleObj } = this.state;
    this.setState({ visible: true, type: 'create' });
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (type === 'create') {
        const params = {
          subProductId,
          ...values,
        };
        this.addModuleEP(params);
      } else {
        const params = {
          id: moduleObj.productModule.id,
          ...values,
        };
        this.updateModuleEP(params);
      }
    });
  }

  updateModuleEP = (params) => {
    updateModuleEP(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新模块成功！');
      this.setState({ visible: false });
      this.getModuleList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  // 先创建模块到jira
  addModuleJira = (values) => {
    const { subProductId } = this.props.location.query;
    const params = {
      subProductId,
      modulename: values.name,
    };
    addModuleJira(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const params = {
        subProductId,
        jiraid: res.result.id,
        ...values,
      };
      this.addModuleEP(params);
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  // 非南京环境拿到jira上的模块id然后创建到ep上
  addModuleEP = (params) => {
    addModuleEP(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('创建模块成功！');
      this.setState({ visible: false });
      this.getModuleList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getFilterData = () => {
    const { moduleList } = this.props;
    const { name } = this.state;
    return moduleList.filter(it => !name.trim() || (it.productModule && it.productModule.name.includes(name)));
  }

  render() {
    const { productid, jiraSync } = this.props.location.query;
    const { moduleList, loading, isBusiness } = this.props;
    const { visible, type, moduleObj } = this.state;

    return (<div style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        <BackToPreview title="返回" link={`/product_setting/subProduct?productid=${productid}`} />
        <div className="bbTitle">
          <span className="name">模块列表</span>
        </div>

        <Card>
          <span className='f-jcsb-aic' style={{ position: 'relative', top: '-10px' }}>
            <span>
              <Search
                allowClear
                onSearch={value => this.setState({ name: value })}
                style={{ width: '220px' }}
                placeholder="搜索名称"
                className="u-mgr10"
              />
            </span>

            <span>
              {
                jiraSync === JIRA_SYNC_OPEN && !isBusiness &&
                <JiraModule moduleList={moduleList} getModuleList={this.getModuleList} />
              }
              <Button type="primary" onClick={() => this.setState({ visible: true, type: 'create' })}>创建模块</Button>
            </span>
          </span>
          <Table
            rowKey={record => record.productModule.id}
            columns={jiraSync !== JIRA_SYNC_OPEN ? this.columns.filter(i => i.dataIndex !== 'jiraid') : this.columns}
            dataSource={this.getFilterData()}
          />
        </Card>

        <Modal
          title={type === 'create' ? '创建模块' : '编辑模块'}
          visible={visible}
          width={800}
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.handleOk()}
          destroyOnClose
          maskClosable={false}
        >
          <ModuleForm
            {...this.props}
            moduleObj={moduleObj}
            type={type} />
        </Modal>
      </Spin>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    moduleList: state.productSetting.moduleList,
    loading: state.loading.effects['productSetting/getModuleListById'],
  };
};

export default connect(mapStateToProps)(BusinessHOC()(Form.create()(index)));
