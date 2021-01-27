import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Input, Button, Modal, Divider, message } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import moment from 'moment';
import { addUserGroup, deleteUserGroup } from '@services/product_setting';
import { deleteModal } from '@shared/CommonFun';
import { USERGROUP_TYPE_MAP } from '@shared/ProductSettingConfig';
import AddGroupForm from './components/AddGroupForm';
import styles from './index.less';

const Search = Input.Search;

class index extends Component {
  state = {
    visible: false,
    record: {}, // 删除用户组需要的
    name: '',
  }

  columns = [{
    title: '名称',
    dataIndex: 'name',
    render: (text, record) => {
      return <span>
        { record.type === USERGROUP_TYPE_MAP.SYSTEM ?
          <span className='f-ib u-mgr5 systemTag'> 系统 </span>
          : ''
        }
        <span>{text}</span>
      </span>;
    }
  }, {
    title: '成员数',
    dataIndex: 'usercount'
  }, {
    title: '创建时间',
    dataIndex: 'addtime',
    render: (text) => {
      return moment(text).format('YYYY-MM-DD HH:mm:ss');
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    width: 300,
    render: (text, record) => {
      const { productid } = this.props.location.query;
      return <span>
        <a onClick={() => history.push(`/product_setting/user_group/userlist?productid=${productid}&groupid=${record.id}`)}>组成员管理</a>
        <Divider type="vertical" />
        <a onClick={() => history.push(`/product_setting/user_group/detail?productid=${productid}&groupid=${record.id}`)}>权限配置</a>
        {
          record.type !== USERGROUP_TYPE_MAP.SYSTEM &&
          <span>
            <Divider type="vertical" />
            <a onClick={() => { this.setState({ record }, () => this.handleDelete()) }} className="delColor">删除</a>
          </span>
        }
      </span>;
    }
  }]

  componentDidMount() {
    this.getUserGroup();
  }

  getUserGroup = () => {
    const { productid } = this.props.location.query;
    this.props.dispatch({ type: 'productSetting/getUserGroupByProductId', payload: { productId: productid } });
  }

  handleOk = () => {
    const { productid } = this.props.location.query;
    const { form, form: { getFieldValue } } = this.props;
    form.validateFields((err, values) => {
      const name = getFieldValue('name');
      const params = {
        productId: productid,
        name: name.trim(),
      };
      addUserGroup(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('添加用户组成功！');
        this.setState({ visible: false });
        history.push(`/product_setting/user_group/detail?productid=${productid}&groupid=${res.result}`);
      }).catch(err => {
        return message.error(err || err.message);
      });
    });
  }

  handleDelete = () => {
    const { record } = this.state;
    deleteModal({
      title: '提示',
      content: '删除后相关成员将失去对应权限，不可恢复',
      okCallback: () => {
        deleteUserGroup(record.id).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除用户组成功！');
          this.getUserGroup();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getData = () => {
    const { userGroup } = this.props;
    const { name } = this.state;
    return userGroup.filter(it => !name.trim().length || it.name.includes(name));
  }

  render() {
    const { lastProduct } = this.props;
    const { visible } = this.state;

    return ([
      <div className='settingTitle'>
        {lastProduct.name}-用户组与权限
      </div>,
      <div className={styles.container}>

        <div className="bbTitle">
          <span className="name">用户组与权限</span>
        </div>

        <Card className="cardBottomNone">
          <div className="u-mgb5 f-tar">
            <span className="u-mgb10">
              <Search
                allowClear
                onSearch={value => this.setState({ name: value })}
                style={{ width: '220px' }}
                placeholder="搜索名称"
              />
              <Button type="primary" className="u-mgl10" onClick={() => this.setState({ visible: true })}>创建用户组</Button>
            </span>
          </div>

          <Table
            columns={this.columns}
            dataSource={this.getData()}
          />

          <Modal
            visible={visible}
            title={'创建用户组'}
            onCancel={() => this.setState({ visible: false })}
            onOk={() => this.handleOk()}
            maskClosable={false}
          >
            <AddGroupForm {...this.props} />
          </Modal>
        </Card>
      </div>]);
  }
}

const mapStateToProps = (state) => {
  return {
    userGroup: state.productSetting.userGroup,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
