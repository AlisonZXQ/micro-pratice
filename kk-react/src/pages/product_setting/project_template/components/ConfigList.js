import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Table, message, Modal, Row, Col, Input, Card, Divider } from 'antd';
import {
  getConfigCustomList, addTemplateCustom, deleteTemplateCustom,
  updateTemplateCustom, getTemplateCustomItem, getTemplateValue, setTemplateValue
} from '@services/product_setting';
import { deleteModal } from '@shared/CommonFun';
import { PROJECT_CUSTOM_USE, PROJECT_CUSTOM_REQUIRED, PROJECT_CUSTOM_TYPE, PROJECT_CUSTOM_TEXT_TYPE } from '@shared/ProductSettingConfig';
import AddCustomField from './AddCustomField';
import styles from '../index.less';

class ConfigList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      productid: 0,
      dialogType: '',
      fieldVisible: false,
      setVisible: false,
      itemData: {},
      valueData: [],
      defaultValueData: [],
      deleteValueData: [],
      customfieldid: 0,
    };
    this.columns = [
      {
        title: '名称',
        dataIndex: 'name',
        render: (text, record) => {
          return <span>{text}</span>;
        }
      },
      {
        title: '键',
        dataIndex: 'fieldkey',
        render: (text, record) => {
          return <span>{text}</span>;
        }
      },
      {
        title: '必填',
        dataIndex: 'required',
        render: (text, record) => {
          return (text === PROJECT_CUSTOM_REQUIRED.REQUIRED ? <span>必填</span> : <span>选填</span>);
        }
      },
      {
        title: '类型',
        dataIndex: 'type',
        render: (text, record) => {
          return (text === PROJECT_CUSTOM_TYPE.TEXT ? <span>文本输入</span> : <span>下拉列表</span>);
        }
      },
      {
        title: '输入框样式',
        dataIndex: 'inputui',
        render: (text, record) => {
          if (record.type === PROJECT_CUSTOM_TYPE.SELECT) {
            return '--';
          } else {
            return (text === PROJECT_CUSTOM_TEXT_TYPE.INPUT ? <span>单行文本框</span> : <span>多行文本域</span>);
          }
        }
      },
      {
        title: '是否使用',
        dataIndex: 'state',
        render: (text, record) => {
          return (text === PROJECT_CUSTOM_USE.OPEN ? <span>启用</span> : <span>关闭</span>);
        }
      },
      {
        title: '值列表',
        dataIndex: 'zanwu',
        render: (text, record) => {
          return (record.type === PROJECT_CUSTOM_TYPE.TEXT ? ('--') : <a onClick={() => this.getValueData(record.id)}>设置</a>);
        }
      },
      {
        title: '排序值',
        dataIndex: 'sortvalue',
        render: (text, record) => {
          return <span>{text}</span>;
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        width: 160,
        render: (text, record) => {
          return (
            <span>
              <a onClick={() => this.openFieldDialog(record.id, 'edit')}>编辑</a>
              <Divider type="vertical" />
              <a className="delColor" onClick={() => { this.handleDelete(record) }}>删除</a>
            </span>
          );
        }
      },
    ];
  }

  componentDidMount() {
    this.setState({ productid: this.props.productid }, () => this.getData());
    this.props.onRef(this);
  }

  getData = () => {
    this.setState({ loading: true });
    const { productid } = this.state;
    const params = {
      productid: productid,
    };
    getConfigCustomList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取信息失败, ${res.msg}`);
      }
      this.setState({ data: res.result });
      this.setState({ loading: false });
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error('获取信息异常', err || err.msg);
    });
  }

  handleOk = () => {
    const { productid, dialogType, itemData } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (dialogType === 'add') {
        const params = {
          productid: productid,
          ...values,
        };
        addTemplateCustom(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`添加失败, ${res.msg}`);
          }
          message.success('添加成功！');
          this.setState({ fieldVisible: false });
          this.getData();
        }).catch((err) => {
          return message.error('添加异常', err || err.msg);
        });
      } else if (dialogType === 'edit') {
        const params = {
          id: itemData.projectTemplateCustomField.id,
          ...values,
        };
        updateTemplateCustom(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`更新失败, ${res.msg}`);
          }
          message.success('更新成功！');
          this.setState({ fieldVisible: false });
          this.getData();
        }).catch((err) => {
          return message.error('更新异常', err || err.msg);
        });
      }

    });
  }

  handleDelete = (item) => {
    const _this = this;
    const params = {
      id: item.id,
    };
    deleteModal({
      title: `您确认要删除自定义字段【${item.fieldkey}】吗?`,
      okCallback: () => {
        deleteTemplateCustom(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`删除失败, ${res.msg}`);
          }
          message.success('删除成功！');
          _this.getData();
        }).catch((err) => {
          return message.error('删除异常', err || err.msg);
        });
      }
    });
  }

  openFieldDialog = (id, type) => {
    if (type === 'edit') {
      const params = {
        id: id,
      };
      getTemplateCustomItem(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`获取单条数据失败, ${res.msg}`);
        }
        this.setState({ dialogType: 'edit' }, () => this.setState({ fieldVisible: true }));
        this.setState({ itemData: res.result });
      }).catch((err) => {
        return message.error('获取单条数据异常', err || err.msg);
      });
    } else if (type === 'add') {
      this.setState({
        dialogType: 'add',
        fieldVisible: true,
      });
    }
  }

  getValueData = (id) => {
    const params = {
      customfieldid: id,
    };
    this.setState({ customfieldid: id });
    this.setState({ deleteValueData: [] });
    getTemplateValue(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取值列表失败, ${res.msg}`);
      }
      if (res.result.length === 0) {
        this.setState({ valueData: [{ customlabel: '', customvalue: '' }] });
      } else {
        this.setState({ valueData: res.result });
        this.setState({ defaultValueData: JSON.parse(JSON.stringify(res.result)) });
      }
      this.setState({ setVisible: true });
    }).catch((err) => {
      return message.error('获取值列表异常', err || err.msg);
    });
  }

  addValueData = () => {
    let data = this.state.valueData;
    data.push({ customlabel: '', customvalue: '' });
    this.setState({ valueData: data });
  }

  deleteValue = (index) => {
    let data = this.state.valueData;
    let dltData = this.state.deleteValueData;
    if (data[index].id) {
      dltData.push({
        action: 'DELETE',
        customvalueid: data[index].id,
        customlabel: data[index].customlabel,
        customvalue: data[index].customvalue,
      });
    }
    this.setState({ deleteValueData: dltData });
    data.splice(index, 1);
    this.setState({ valueData: data });
  }

  saveValueData = () => {
    const data = this.state.valueData;
    const defaultData = this.state.defaultValueData;
    data.map((item) => { //判空
      if (item.customlabel === '' && item.customvalue === '') {
        return message.warning('名称和值不能为空');
      }
    });
    let newData = [];
    const dltData = this.state.deleteValueData;
    dltData && dltData.map((item) => {
      newData.push(item);
    });
    data.map((item) => {
      if (JSON.stringify(defaultData).indexOf(JSON.stringify(item)) > -1) {
        return;
      } else if (item.id) {
        newData.push({
          action: 'UPDATE',
          customvalueid: item.id,
          customlabel: item.customlabel,
          customvalue: item.customvalue,
        });
      } else {
        newData.push({
          action: "ADD",
          customlabel: item.customlabel,
          customvalue: item.customvalue,
        });
      }
    });
    const params = {
      customfieldid: this.state.customfieldid,
      value: JSON.stringify(newData),
    };
    setTemplateValue(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`设置值失败, ${res.msg}`);
      }
      message.success('设置值成功');
      this.setState({ setVisible: false });
    }).catch((err) => {
      return message.error('设置值异常', err || err.msg);
    });
  }

  setLabel = (index, value) => {
    let data = this.state.valueData;
    for (let i = 0; i < data.length; i++) {
      if (i === index) {
        data[i].customlabel = value;
      }
    }
    this.setState({ valueData: data });
  }

  setValue = (index, value) => {
    let data = this.state.valueData;
    for (let i = 0; i < data.length; i++) {
      if (i === index) {
        data[i].customvalue = value;
      }
    }
    this.setState({ valueData: data });
  }

  render() {
    const { loading, data, dialogType, fieldVisible, setVisible, itemData, valueData } = this.state;
    return (
      <div>
        {/* <div className='bbTitle f-jcsb-aic'>
          <span className='name'>字段列</span>
          <Button
            type="primary"
            onClick={() => this.openFieldDialog(0, 'add')}>
            添加自定义字段
          </Button>
        </div> */}
        <Card className="cardBottomNone">
          <Table
            dataSource={data}
            columns={this.columns}
            loading={loading}
          />
        </Card>

        <Modal
          title={dialogType === 'add' ? '添加自定义字段' : '编辑自定义字段'}
          visible={fieldVisible}
          onOk={() => this.handleOk()}
          width={900}
          onCancel={() => this.setState({ fieldVisible: false }, () => this.setState({ itemData: {} }))}
          destroyOnClose
          maskClosable={false}
        >
          {itemData && <AddCustomField
            itemData={itemData}
            form={this.props.form}
          />}
        </Modal>
        <Modal
          title='设置值列表'
          visible={setVisible}
          onOk={() => this.saveValueData()}
          width={900}
          onCancel={() => this.setState({ setVisible: false, deleteValueData: [] })}
          maskClosable={false}
        >
          <Row className={styles.svTitle}>
            <Col span={8} style={{ padding: '12px 40px 12px' }}>显示名称</Col>
            <Col span={8} style={{ padding: '12px 40px 12px' }}>存储值</Col>
            <Col span={8} style={{ padding: '12px 40px 12px' }}>操作</Col>
          </Row>
          {valueData && valueData.map((item, index) => (
            <Row className='u-mgt10'>
              <Col span={8} className='u-pdl40'>
                <Input
                  onChange={(e) => this.setLabel(index, e.target.value)}
                  value={item.customlabel}
                  style={{ width: '200px' }}
                  placeholder='显示名称' />
              </Col>
              <Col span={8} className='u-pdl40'>
                <Input
                  onChange={(e) => this.setValue(index, e.target.value)}
                  value={item.customvalue}
                  style={{ width: '200px' }}
                  placeholder='存储值' />
              </Col>
              <Col span={8} className='delColor u-pdl40'>
                <span className='f-csp' onClick={() => this.deleteValue(index)}>删除</span>
              </Col>
            </Row>
          ))}

          <Button
            type="dashed"
            className='u-mgt20 u-mgl40'
            onClick={() => this.addValueData()}
            icon={<PlusOutlined />}>
            添加值配置
          </Button>
        </Modal>
      </div>
    );
  }
}


export default ConfigList;
