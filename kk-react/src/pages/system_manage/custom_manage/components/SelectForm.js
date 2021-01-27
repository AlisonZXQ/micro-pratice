import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Input, Row, Col, Checkbox, Button, message } from 'antd';
import uuid from 'uuid';
import { equalsObj, deepCopy } from '@utils/helper';
import { updateCustomField } from '@services/product_setting';
import { getCustomFieldSet } from '@services/system_manage';
import { CUSTOME_TYPE_MAP, CUSTOM_SELECTTYPE_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

class AddSelectDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setVisible: false,
      valueData: [{ customlabel: '' }],
      defaultValueData: [],
      checked: false,
      customfieldid: 0,
    };
  }

  componentDidMount() {
    const { record } = this.props;
    if (record && record.id && (record.type === CUSTOME_TYPE_MAP.SELECT || record.type === CUSTOME_TYPE_MAP.MULTISELECT)) {
      this.getDefaultData(record.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.record, nextProps.record)) {
      const id = nextProps.record && nextProps.record.id;
      const type = nextProps.record && nextProps.record.type;
      if ((type === CUSTOME_TYPE_MAP.SELECT || type === CUSTOME_TYPE_MAP.MULTISELECT) && id) {
        this.getDefaultData(id);
      }
    }
  }

  getDefaultData = (id) => {
    const setPromise = Promise.resolve(getCustomFieldSet(id));
    setPromise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const data = res.result.platformCustomFieldValueVOList || [];
      const checked = res.result.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}` ? true : false;
      this.setState({
        valueData: data,
        defaultValueData: data,
        checked,
      });
      this.props.setSelectData('selectData', deepCopy(data, []));
      this.props.setSelectData('defaultSelectData', deepCopy(data, []));
      this.props.setSelectData('defaultSelectChecked', checked);
      this.props.setSelectData('selectChecked', checked);
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  setChecked = (value) => {
    const params = {
      id: this.state.customfieldid,
      selectui: value === true ? CUSTOM_SELECTTYPE_MAP.TILE : CUSTOM_SELECTTYPE_MAP.SELECT,
    };
    updateCustomField(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`更新失败, ${res.msg}`);
      }
      message.success('更新成功！');
      this.props.getData();
    }).catch((err) => {
      return message.error('更新异常', err || err.msg);
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
    this.props.setSelectData('selectData', data);
  }

  setValue = (index, value) => {
    let data = this.state.valueData;
    for (let i = 0; i < data.length; i++) {
      if (i === index) {
        data[i].customvalue = value;
      }
    }
    this.setState({ valueData: data });
    this.props.setSelectData('selectData', data);
  }

  deleteValue = (id) => {
    const { valueData } = this.state;
    const data = valueData;
    const index = data.findIndex(it => it.id === id);

    data.splice(index, 1);
    this.setState({ valueData: data });
    this.props.setSelectData('selectData', data);
  }

  addValueData = () => {
    let data = this.state.valueData;
    data.push({
      customlabel: '',
      id: uuid()
    });
    this.setState({ valueData: data });
    this.props.setSelectData('selectData', data);
  }

  changeCheck = (value) => {
    this.setState({ checked: value });
    this.props.setSelectData('selectChecked', value);
  }

  render() {
    const { valueData } = this.state;

    return (
      <span>
        <Row className={styles.svTitle}>
          <Col span={16} style={{ padding: '12px 40px 12px' }}>显示名称</Col>
          <Col span={8} style={{ padding: '12px 40px 12px' }}>操作</Col>
        </Row>
        {valueData && valueData.map((item, index) => (
          <Row className='u-mgt10'>
            <Col span={16} className='u-pdl40'>
              <Input
                onChange={(e) => this.setLabel(index, e.target.value)}
                value={item.customlabel}
                style={{ width: '450px' }}
                placeholder='显示名称' />
            </Col>
            <Col span={8} className='delColor u-pdl40'>
              <span className='f-csp' onClick={() => this.deleteValue(item.id)}>删除</span>
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

        <div className='u-mgt20 u-mgl40'>
          <Checkbox
            checked={this.state.checked}
            onChange={(e) => this.changeCheck(e.target.checked)}>
            将选项设为平铺展示(radio/checkbox)
          </Checkbox>
        </div>
      </span>
    );
  }
}

export default AddSelectDialog;
