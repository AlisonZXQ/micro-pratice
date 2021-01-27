import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Spin, message, Modal, Input, Card, Divider } from 'antd';
import { getFormLayout } from '@utils/helper';
import {
  getTemplateList, updateTemplate, addTemplate, customRelation,
  getConfigCustomList, deleteTemplate, setDefault, setConfigTemplate
} from '@services/product_setting';
import { deleteModal } from '@shared/CommonFun';
import { PROJECT_TEMPLATE_SYSTEM_TYPE, PROJECT_TEMPLATE_DEFAULT_TYPE } from '@shared/ProductSettingConfig';
import ConfigTemplate from './ConfigTemplate';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(5, 13);

class TemplateList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      configData: [],
      templateVisible: false,
      configVisible: false,
      itemData: '',
      checkedItems: [],
      projectData: [],
      resultData: [],
    };
    this.columns = [
      {
        title: '模板名称',
        dataIndex: 'name',
        render: (text, record) => {
          return <span>
            {record.projectTemplate.name}
            {record.projectTemplate.isDefault === PROJECT_TEMPLATE_DEFAULT_TYPE.DEFAULT &&
              <span className={`${styles.tag} u-mgl10`}>默认</span>
            }
          </span>;
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        width: 200,
        render: (text, record) => {
          return (<div>
            <a
              disabled={record.projectTemplate.isSystem === PROJECT_TEMPLATE_SYSTEM_TYPE.SYSTEM}
              onClick={() => this.openTemplateDialog(record, 'edit')}>编辑</a>
            <Divider type="vertical" />
            <a
              disabled={record.projectTemplate.isSystem === PROJECT_TEMPLATE_SYSTEM_TYPE.SYSTEM}
              onClick={() => this.openConfigDialog(record)}>模板配置</a>
            <Divider type="vertical" />
            <a
              disabled={record.projectTemplate.isSystem === PROJECT_TEMPLATE_SYSTEM_TYPE.SYSTEM}
              className='delColor' onClick={() =>
                this.setState({ itemData: record.projectTemplate }, () => this.handleDelete())
              }>删除</a>
            <Divider type="vertical" />
            <a
              onClick={() => this.setDefault(record.projectTemplate.id)}
              disabled={record.projectTemplate.isDefault === PROJECT_TEMPLATE_DEFAULT_TYPE.DEFAULT}>
              设为默认
            </a>
          </div>);
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
    getTemplateList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取列表失败, ${res.msg}`);
      }
      this.setState({ dataSource: res.result });
      this.setState({ loading: false });
    }).catch((err) => {
      return message.error('获取列表异常', err || err.msg);
    });
  }

  setDefault = (id) => {
    const params = {
      id: id,
    };
    setDefault(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`设置默认值失败, ${res.msg}`);
      }
      this.getData();
      return message.success(`设置默认值成功`);
    }).catch((err) => {
      return message.success(`设置默认值异常, ${err || err.msg}`);
    });
  }

  openTemplateDialog = (record, type) => {
    if (type === 'add') {
      this.setState({ itemData: {} });
    } else if (type === 'edit') {
      this.setState({ itemData: record.projectTemplate });
    }
    this.setState({
      templateType: type,
      templateVisible: true,
    });
  }

  openConfigDialog = (record) => {
    this.setState({
      configVisible: true,
      itemData: record.projectTemplate,
    }, () => this.getCustomRelation());
  }

  getCustomRelation = () => {
    const params = {
      templateid: this.state.itemData.id,
    };
    customRelation(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取关联关系失败, ${res.msg}`);
      }
      const array = res.result;
      let checkedItems = [];
      array.map((item) => {
        checkedItems.push(item);
      });
      this.setState({ checkedItems });
      this.getConfigData();
    }).catch((err) => {
      return message.error('获取关联关系异常', err || err.msg);
    });
  }

  getConfigData = () => {
    const params = {
      productid: this.props.productid,
    };
    getConfigCustomList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取列表失败, ${res.msg}`);
      }
      this.setState({ configData: res.result });
    }).catch((err) => {
      return message.error('获取列表异常', err || err.msg);
    });
  }

  handleTemplateOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { setFieldsValue } = this.props.form;
      setFieldsValue({ name: '' });

      const { templateType } = this.state;
      if (templateType === 'edit') {
        const params = {
          id: this.state.itemData.id,
          name: values.name,
        };
        updateTemplate(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`更改信息失败, ${res.msg}`);
          }
          message.success('更改信息成功！');
          this.getData();
          this.setState({ templateVisible: false });
        }).catch((err) => {
          return message.error('更改信息异常', err || err.msg);
        });
      } else if (templateType === 'add') {
        const params = {
          productid: this.props.productid,
          name: values.name,
        };
        addTemplate(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`新增模板失败, ${res.msg}`);
          }
          message.success('新增模板成功！');
          this.getData();
          this.setState({ templateVisible: false });
        }).catch((err) => {
          return message.error('新增模板异常', err || err.msg);
        });
      }
    });
  }

  handleConfigOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let flowList = [];
        for (let i in values) {
          if (i.indexOf('flow') > -1 && values[i]) {
            flowList.push({
              type: Number(i.split('-')[1]),
              id: values[i],
            });
          }
        }
        const { projectData, resultData, itemData } = this.state;
        const projectList = [...projectData, ...resultData];
        const params = {
          id: itemData.id,
          projectTemplateCustomfieldDtoList: projectList,
          projectTemplateWorkflowDtoList: flowList,
        };
        setConfigTemplate(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`设置失败, ${res.msg}`);
          }
          this.setState({ configVisible: false });
          return message.success('设置成功！');
        }).catch((err) => {
          return message.error('设置异常', err || err.msg);
        });
      }
    });

  }

  handleDelete = () => {
    const { itemData } = this.state;
    const params = {
      id: itemData.id,
    };
    deleteModal({
      title: '提示',
      content: `您确认要删除项目模板【${itemData && itemData.name}】吗?`,
      okCallback: () => {
        deleteTemplate(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`删除失败, ${res.msg}`);
          }
          message.success('删除成功！');
          this.getData();
        }).catch((err) => {
          return message.error('删除异常', err || err.msg);
        });
      }
    });
  }

  getConfigBaseData = (data, type) => {
    let newData = [];
    if (type === 'project') {
      data.forEach((item) => {
        if (!newData.find((it) => it.id !== item.id && it.type !== 1) && item.type) {
          newData.push({
            id: item.id,
            type: 1
          });
        }
      });
      this.setState({ projectData: newData });
    } else if (type === 'result') {
      data.forEach((item) => {
        if (!newData.find((it) => it.id !== item.id && it.type !== 2) && item.type) {
          newData.push({
            id: item.id,
            type: 2
          });
        }
      });
      this.setState({ resultData: newData });
    }
  }

  render() {
    const { dataSource, itemData, configData, checkedItems } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (<Spin spinning={this.state.loading}>
      <Card className="cardBottomNone">
        <Table
          dataSource={dataSource}
          columns={this.columns}
        />
      </Card>
      <Modal
        title={itemData && itemData.name ? '编辑模板' : '创建模板'}
        visible={this.state.templateVisible}
        onOk={() => this.handleTemplateOk()}
        onCancel={() => this.setState({ templateVisible: false })}
        destroyOnClose={true}
        maskClosable={false}
      >
        <FormItem label="名称" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入模板名称！' }],
            initialValue: itemData && itemData.name,
          })(
            <Input placeholder="请输入模板名称" />,
          )}
        </FormItem>
      </Modal>

      <Modal
        width={1100}
        title="模板配置"
        okText="保存"
        visible={this.state.configVisible}
        onOk={() => this.handleConfigOk()}
        onCancel={() => this.setState({ configVisible: false })}
        destroyOnClose={true}
        maskClosable={false}
      >
        <ConfigTemplate
          getConfigBaseData={this.getConfigBaseData}
          form={this.props.form}
          data={configData}
          productid={this.props.productid}
          checkedItems={checkedItems}
          itemData={itemData}
        />
      </Modal>
    </Spin>);
  }
}


export default TemplateList;
