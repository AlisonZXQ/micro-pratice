import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, Row, message, Table, Divider, Modal, Button } from 'antd';
import { getCascadeList } from '@services/project';
import { getEntProduct, addCascaderField, getCascaderField, updateCascaderField, deleteField } from '@services/system_manage';
import { getConfigCustomList } from '@services/product_setting';
import { deleteModal } from '@shared/CommonFun';
import { CASCADE_TYPE, REQUIRE_TYPE, ENTERPRISE_MAP } from '@shared/SystemManageConfig';
import BasicForm from './components/BasicForm';
import CascaderSetting from './components/CascaderSetting';

const Option = Select.Option;

class index extends Component {
  state = {
    productData: [],
    productId: '',
    visible: false,
    type: '',
    cascadeList: [],
    editData: {},
    cascadeData: [],
    setFlag: false,
    record: {}
  }

  columns = [{
    title: '产品',
    dataIndex: 'subProduct',
    render: (text, record) => {
      return record.product && record.product.name;
    }
  }, {
    title: '类型',
    dataIndex: 'type',
    render: (text, record) => {
      const cascadeField = record.cascadeField || {};
      return cascadeField.type === CASCADE_TYPE.PROJECT ? '项目' : '单据';
    }
  }, {
    title: '自定义字段',
    dataIndex: 'zidingyi',
    render: (text, record) => {
      const projectTemplateCustomField = record.projectTemplateCustomField || {};
      return projectTemplateCustomField.name;
    }
  }, {
    title: '关联字段名称',
    dataIndex: 'subProduct',
    render: (text, record) => {
      const cascadeField = record.cascadeField || {};
      return cascadeField.fieldname;
    }
  }, {
    title: '是否必填',
    dataIndex: 'subProduct',
    render: (text, record) => {
      const cascadeField = record.cascadeField || {};
      return cascadeField.required === REQUIRE_TYPE.REQUIRE ? '必填' : '选填';
    }
  }, {
    title: '操作',
    dataIndex: 'subProduct',
    render: (text, record) => {
      return (<>
        <a onClick={() => this.getCascaderField(record)}>编辑</a>
        <Divider type="vertical" />
        <a onClick={() => this.setState({ setFlag: true, record })}>值配置</a>
        <Divider type="vertical" />
        <a className="delColor" onClick={() => { this.setState({ record }, () => this.handleDelete()) }}>删除</a>
      </>);
    }
  }]

  componentDidMount() {
    this.getEntProduct();
  }

  getEntProduct = (id) => {
    const params = {
      entid: ENTERPRISE_MAP.NETEASE,
    };
    getEntProduct(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ productData: res.result });
      if (res.result[0]) {
        this.setState({ productId: res.result[0].id }, () => this.getCascadeList());
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取产品异常`);
    });
  }

  getCascadeList = () => {
    const { productId } = this.state;
    const params = {
      productid: productId,
      type: CASCADE_TYPE.PROJECT,
    };
    getCascadeList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ cascadeData: res.result || [] });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getCascaderField = (record) => {
    this.setState({ visible: true, type: 'edit' });
    const params = {
      id: record.cascadeField.id
    };
    getCascaderField(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ editData: res.result || {} });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleChange = (value) => {
    this.setState({ productId: value }, () => this.getCascadeList());
  }

  handleAddCascader = () => {
    const { productId } = this.state;
    this.setState({ visible: true, type: 'create' });
    getConfigCustomList({ productid: productId }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const data = res.result || [];
      this.setState({ cascadeList: data.filter(i => i.type === CASCADE_TYPE.RECEIPT) });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { type, productId, editData } = this.state;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      let promise = null;
      if (type === 'create') {
        const params = {
          productid: productId,
          type: CASCADE_TYPE.PROJECT,
          ...values,
        };
        promise = addCascaderField(params);
      } else {
        const params = {
          id: editData.cascadeField.id,
          ...values,
        };
        promise = updateCascaderField(params);
      }
      promise.then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('创建/更新字段成功！');
        this.setState({ visible: false });
        this.getCascadeList();
      }).catch(err => {
        return message.error(err || err.message);
      });
    });
  }

  handleDelete = () => {
    const { record } = this.state;
    const cascadeField = record.cascadeField || {};
    deleteModal({
      title: '确认删除',
      content: `您确认要删除关联字段【${cascadeField.fieldname}】吗`,
      okCallback: () => {
        deleteField({ id: cascadeField.id }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除成功！');
          this.getCascadeList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });

  }

  render() {
    const { productData, visible, type, cascadeList, editData, productId, cascadeData, setFlag, record } = this.state;
    const cascadeField = record.cascadeField || {};

    return (<span>

      <Row>请选择产品：
        <Select
          style={{ width: 300 }}
          value={productId}
          onChange={(value) => this.handleChange(value)}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          {
            productData && productData.map(it =>
              <Option key={it.id} value={it.id}>
                {it.name}
              </Option>)
          }
        </Select>
      </Row>

      {!setFlag &&
        <>
          <div className="f-tar u-mgb10">
            <Button onClick={() => this.handleAddCascader()} type="primary" disabled={!productId}>创建关联字段</Button>
          </div>
          <Table
            rowKey={(record) => record.cascadeField.id}
            columns={this.columns}
            dataSource={cascadeData}
          />
        </>
      }

      {
        setFlag && <CascaderSetting id={cascadeField.id} callback={() => this.setState({ setFlag: false })} />
      }

      <Modal
        visible={visible}
        title={type === 'create' ? '创建级联字段' : '编辑级联字段'}
        onOk={() => this.handleOk()}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
      >
        <BasicForm {...this.props} type={type} cascadeList={cascadeList} editData={editData} />
      </Modal>
    </span>);
  }

}

export default Form.create()(index);
