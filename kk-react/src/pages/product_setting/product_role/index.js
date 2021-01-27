import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Button, Divider, Input, message, Popconfirm } from 'antd';
import uuid from 'uuid';
import moment from 'moment';
import { connect } from 'dva';
import { deepCopy } from '@utils/helper';
import TextOverFlow from '@components/TextOverFlow';
import { getProductRole, addProductRole, updateProductRole, deleteProductRole } from '@services/product_setting';
import styles from './index.less';

const Search = Input.Search;

class index extends Component {
  state = {
    data: [],
    name: ''
  }

  columns = [{
    title: '名称',
    dataIndex: 'roleName',
    render: (text, record, index) => {
      const { form: { getFieldDecorator } } = this.props;
      if (record.edit) {
        return {
          children: <span>
            {
              getFieldDecorator(`${record.id}`, {
                initialValue: text,
                rules: [{ required: true, message: '此项必填！' }],
              })(
                <Input placeholder="请输入，不超过50个字符" maxLength={50} />
              )
            }
          </span>,
          props: {
            colSpan: 3,
          }
        };
      } else {
        return <TextOverFlow content={text} maxWidth={'300px'} />;
      }
    }
  }, {
    title: '成员数',
    dataIndex: 'usercount',
    render: (text, record) => {
      const obj = {
        children: text,
        props: {},
      };
      if (record.edit) {
        obj.props.colSpan = 0;
      }
      return obj;
    },
  }, {
    title: '创建时间',
    dataIndex: 'addtime',
    render: (text, record) => {
      const obj = {
        children: moment(text).format('YYYY-MM-DD HH:mm:ss'),
        props: {},
      };
      if (record.edit) {
        obj.props.colSpan = 0;
      }
      return obj;
    },
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    width: 200,
    render: (text, record) => {
      return <span>
        {
          record.edit &&
          <span>
            <a onClick={() => this.handleSave(record.id)}>保存</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleChangeCancel(record.id)}>取消</a>
          </span>
        }
        {
          !record.edit &&
          <span>
            <a onClick={() => this.handleChangeEdit(record.id)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="删除后将直接影响相关数据?"
              onConfirm={() => this.handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a className="delColor">删除</a>
            </Popconfirm>
          </span>
        }
      </span>;
    }
  }]

  componentDidMount() {
    this.getProductRole();
  }

  getProductRole = () => {
    const { productid } = this.props.location.query;
    getProductRole({ productId: productid }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ data: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleSave = (id) => {
    const { productid } = this.props.location.query;
    const { form: { getFieldValue } } = this.props;
    if (!getFieldValue(`${id}`)) {
      return message.error('岗位名称必填！');
    }
    if (typeof id === 'string') {
      const params = {
        productid,
        roleName: getFieldValue(`${id}`),
      };
      addProductRole(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('添加岗位成功！');
        this.getProductRole();
      }).catch(err => {
        return message.error(err || err.message);
      });
    } else {
      const params = {
        id,
        roleName: getFieldValue(`${id}`),
      };
      updateProductRole(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('更新岗位成功！');
        this.getProductRole();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  }

  handleChangeCancel = (id) => {
    const { data } = this.state;
    let arr = deepCopy(data, []);
    const obj = arr.find(it => it.id === id);
    const index = arr.findIndex(it => it.id === id);
    obj.edit = false;
    // 当前的记录如果是新创建的name字段没有的则取消就直接删除了
    if (obj.roleName) {
      arr.splice(index, 1, obj);
    } else {
      arr.splice(index, 1);
    }
    this.setState({ data: arr });
  }

  handleChangeEdit = (id) => {
    const { data } = this.state;
    let arr = deepCopy(data, []);

    const obj = arr.find(it => it.id === id);
    const index = arr.findIndex(it => it.id === id);
    obj.edit = true;
    arr.splice(index, 1, obj);
    this.setState({ data: arr });
  }

  handleDelete = (id) => {
    deleteProductRole({ id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('已成功删除该岗位！');
      this.getProductRole();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleAddRole = () => {
    const { data } = this.state;
    const arr = [...data];

    const obj = {
      id: `ZXQHAPPY-${uuid()}`,
      name: '',
      num: '',
      time: '',
      edit: true,
    };
    arr.unshift(obj);

    this.setState({ data: arr });
  }

  getData = () => {
    const { data, name } = this.state;
    return data.filter(it => !name || it.roleName.includes(name));
  }

  getDisabled = () => {
    const { data, name } = this.state;
    const arr = data.filter(it => !name || it.roleName.includes(name));
    return arr.some(it => it.edit);
  }

  render() {
    const { lastProduct } = this.props;

    return ([
      <div className='settingTitle'>
        {lastProduct.name}-岗位管理
      </div>,
      <div className={styles.container}>
        <div className="bbTitle">
          <span className="name">岗位管理</span>
        </div>

        <Card>
          <div className="u-mgb5 f-jcsb">
            <span className="f-fs1" style={{ position: 'relative', top: '8px' }}>用来管理当前产品成员的岗位选择，可用作数据统计</span>
            <span className="u-mgb10">
              <Search
                allowClear
                onSearch={value => this.setState({ name: value })}
                style={{ width: '220px' }}
                placeholder="搜索名称"
              />
              <Button
                type="primary"
                className="u-mgl10"
                onClick={() => this.handleAddRole()}
                disabled={this.getDisabled()}
              >创建岗位</Button>
            </span>
          </div>

          <Table
            columns={this.columns}
            dataSource={this.getData()}
            pagination={false}
            scroll={{ y: 500 }}
          />
        </Card>
      </div>]);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
