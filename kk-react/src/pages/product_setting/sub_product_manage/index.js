import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Input, Button, Modal, Divider, message } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import BusinessHOC from '@components/BusinessHOC';
import { addSubproduct, updateSubproduct, deleteSubproduct, getSubproductDetail, handleEnableOrUnable } from '@services/product_setting';
import { DEFAULT_SUB_PRODUCT, JIRA_SYNC_USE, subproductIssueTypeArr, subproductEffectArr, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import { warnModal } from '@shared/CommonFun';
import TextOverFlow from '@components/TextOverFlow';
import ProductForm from './components/ProductForm';
import DeleteForm from './components/DeleteForm';
import styles from './index.less';

const Search = Input.Search;
const isEmpty = (text) => {
  return text ? text : '-';
};

class index extends Component {
  state = {
    visible: false,
    data: {}, // 编辑获取的详情
    type: '', // create创建 edit编辑
    current: 1,
    name: '',
    record: {} // 删除获取的id
  }

  columns = [{
    title: '名称',
    dataIndex: 'subProductName',
    render: (text, record) => {
      return <span>
        {record.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT ?
          <span className='f-ib u-mgr5 systemTag'> 系统 </span>
          : ''
        }
        <TextOverFlow content={text} maxWidth={'30vw'} />
      </span>;
    }
  }, {
    title: '负责人',
    dataIndex: 'responseUser',
    render: (text) => {
      return `${text ? `${text.name} ${text.email}` : '-'}`;
    }
  }, {
    title: '状态',
    dataIndex: 'isEnable',
    render: (text) => {
      return <span className="systemTag">{text === SUB_PRODUCT_ENABLE.ENABLE ? '启用' : '停用'}</span>;
    }
  }, {
    title: 'jira键',
    dataIndex: 'jiraKey',
    render: (text, record) => {
      const jiraSync = record.jiraSync;

      return jiraSync === JIRA_SYNC_USE.OPEN ? isEmpty(text) : '-';
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      const { productid } = this.props.location.query;
      const isDefault = record.isDefault;
      const jiraSync = record.jiraSync;
      const { isBusiness } = this.props;

      return <span>
        <a onClick={() => this.handleEdit(record.id)}>编辑</a>
        <Divider type="vertical" />
        <Link
          to={`/product_setting/subProduct/module?productid=${productid}&subProductId=${record.id}&subProductName=${record.subProductName}&jiraSync=${record.jiraSync}`}>管理模块</Link>
        <Divider type="vertical" />
        <Link
          to={`/product_setting/subProduct/version?productid=${productid}&subProductId=${record.id}&subProductName=${record.subProductName}&jiraSync=${record.jiraSync}`}>管理版本</Link>
        <Divider type="vertical" />
        {
          jiraSync === JIRA_SYNC_USE.OPEN && !isBusiness &&
          <span>
            <Link to={`/product_setting/subProduct/mergestatus?productid=${productid}&subProductId=${record.id}&subProductName=${record.subProductName}`} disabled={!record.jiraKey}>管理与jira映射表</Link>
            <Divider type="vertical" />
          </span>
        }
        {
          <a
            onClick={() => this.handleEnableOrUnable(record)}
            disabled={isDefault === DEFAULT_SUB_PRODUCT.DEFAULT}
          >
            {record.isEnable === SUB_PRODUCT_ENABLE.ENABLE ? '停用' : '启用'}
          </a>
        }
        <Divider type="vertical" />
        <a
          disabled={isDefault === DEFAULT_SUB_PRODUCT.DEFAULT}
          onClick={() => this.handleDeleteModal(record)} className="delColor">删除
        </a>
      </span>;
    }
  }]

  componentDidMount() {
    this.getSubproductByPage();
  }

  handleEdit = (id) => {
    this.setState({ visible: true, type: 'edit' });
    this.getSubproductDetail(id);
  }

  getSubproductDetail = (id) => {
    getSubproductDetail(id).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ data: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDeleteModal = (record) => {
    const { productid } = this.props.location.query;
    this.setState({ visible: true, type: 'delete', record });
    this.props.dispatch({ type: 'product/getAllSubProductList', payload: { productid } });
  }

  handleEnableOrUnable = (record) => {
    const content = record.isEnable === SUB_PRODUCT_ENABLE.ENABLE ? '确定停用该子产品吗?' : '确定启用该子产品吗?';
    const params = {
      id: record.id,
      enable: record.isEnable === SUB_PRODUCT_ENABLE.ENABLE ? SUB_PRODUCT_ENABLE.UNABLE : SUB_PRODUCT_ENABLE.ENABLE
    };
    warnModal({
      title: '提示',
      content: content,
      okCallback: () => {
        handleEnableOrUnable(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success(`子产品${record.isEnable === SUB_PRODUCT_ENABLE.ENABLE ? '停用' : '启用'}成功`);
          this.getSubproductByPage();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getSubproductByPage = () => {
    const { productid } = this.props.location.query;
    const { name, current } = this.state;
    const params = {
      productId: productid,
      name,
      offset: (current - 1) * 10,
      limit: 10,
    };
    this.props.dispatch({ type: 'productSetting/getSubproductByPage', payload: params });
  }

  handleOk = () => {

    const { form: { getFieldValue } } = this.props;
    const { type, record } = this.state;
    if (type === 'delete') {
      const params = {
        id: record.id,
        transferSubProductId: getFieldValue('toProduct'),
      };
      deleteSubproduct(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('删除子产品成功！');
        this.setState({ visible: false });
        this.getSubproductByPage();
      }).catch(err => {
        return message.error(err || err.message);
      });
    } else {
      this.handleCreateEdit();
    }
  }

  handleCreateEdit = () => {
    const { productid } = this.props.location.query;
    const { data, type } = this.state;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      delete values.toProduct;
      const limit = {};
      //格式转换
      subproductEffectArr.map(it => {
        limit[it.key] = values.effect && values.effect.indexOf(it.key) > -1 ? true : false;
      });
      subproductIssueTypeArr.map(it => {
        limit[it.key] = values.issueType && values.issueType.indexOf(it.key) > -1 ? true : false;
      });
      delete values.effect;
      delete values.issueType;

      if (type === 'create') {
        const params = {
          ...values,
          subProductConfig4JiraBo: limit,
          productId: productid,
          jiraSync: values.jiraSync === true ? 1 : 2,
        };
        addSubproduct(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('创建子产品成功！');
          this.setState({ visible: false });
          this.getSubproductByPage();
        }).catch(err => {
          return message.error(err || err.message);
        });
      } else if (type === 'edit') {
        const params = {
          ...data,
          ...values,
          subProductConfig4JiraBo: limit,
          jiraSync: values.jiraSync === true ? 1 : 2,
        };
        updateSubproduct(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('更新子产品成功！');
          this.setState({ visible: false });
          this.getSubproductByPage();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handlePageChange = (num) => {
    this.setState({ current: num }, () => this.getSubproductByPage());
  }

  render() {
    const { subProductObj, subProductAll, lastProduct, isBusiness } = this.props;

    const { visible, data, type, current, record } = this.state;
    const filterColumns = isBusiness ? this.columns.filter(it => it.dataIndex !== 'jiraKey') : this.columns;

    return ([
      <div className='settingTitle'>
        {lastProduct.name}-子产品配置
      </div>,
      <div className={styles.container}>
        <div className="bbTitle">
          <span className="name">子产品配置</span>
        </div>

        <Card className="cardBottomNone">
          <div className="u-mgb5 f-jcsb">
            <span className="f-fs1" style={{ position: 'relative', top: '8px' }}>用来管理当前产品是否拥有子产品，配置后相关单据数据都会增加”子产品“的下拉选项</span>
            <span className="u-mgb10">
              <Search
                allowClear
                onSearch={(value) => this.setState({ name: value }, () => this.getSubproductByPage())}
                style={{ width: '220px' }}
                placeholder="搜索名称"
              />
              <Button type="primary" className="u-mgl10" onClick={() => this.setState({ visible: true, type: 'create' })}>创建子产品</Button>
            </span>
          </div>

          <Table
            columns={filterColumns}
            dataSource={subProductObj.data}
            pagination={{
              pageSize: 10,
              current: current,
              onChange: this.handlePageChange,
              defaultCurrent: 1,
              total: subProductObj.total,
            }}
          />

          <Modal
            visible={visible}
            title={type === 'create' ? '创建子产品' : type === 'edit' ? '编辑子产品' : '确认删除？'}
            onCancel={() => this.setState({ visible: false })}
            onOk={() => this.handleOk()}
            destroyOnClose
            maskClosable={false}
            width={700}
          >
            {
              (type === 'create' || type === 'edit') &&
              <ProductForm {...this.props} data={data} type={type} />
            }
            {
              type === 'delete' &&
              <DeleteForm {...this.props} subProductAll={subProductAll} record={record} />
            }
          </Modal>
        </Card>
      </div>]);
  }
}

const mapStateToProps = (state) => {
  return {
    subProductObj: state.productSetting.subProductObj,
    subProductAll: state.product.subProductAll,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(BusinessHOC()(index)));
