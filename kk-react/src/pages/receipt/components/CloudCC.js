import React, { Component } from 'react';
import { Modal, Radio, Input, Spin, message, Pagination } from 'antd';
import { connect } from 'dva';
import { queryCloudCC, batchAddCloudCC } from '@services/receipt';
import { deepCopy } from '@utils/helper';

const RadioGroup = Radio.Group;
const { Search } = Input;

class index extends Component {
  state = {
    visible: false,
    current: 1,
    value: '',
    data: {},
    result: {},
    name: '',
    cloudccid: '',
    loading: false,
    selectCC: {}, // 选中的cloudCC整个对象，为了填充同表中的其他字段
  }

  resetData = () => {
    this.setState({
      visible: false,
      current: 1,
      value: '',
      data: {},
      result: {},
      name: '',
      cloudccid: '',
      loading: false,
      selectCC: {},
    });
  }

  componentDidMount() {
    console.log('cloudcc弹窗属性集: ', this.props);
  }

  queryCloudCC = () => {
    const { lastProduct, data } = this.props;
    const { current, value } = this.state;
    const params = {
      productid: lastProduct.id,
      key: data.cloudcc_key,
      field: data.cloudcc_field,
      value,
      page: current,
      limit: 20,
    };
    if (value && value.trim().length) {
      this.setState({ loading: true });
      queryCloudCC(params).then(res => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(res.msg);
        const obj = res.result ? JSON.parse(res.result) : {};
        this.setState({ result: obj });
      }).catch(err => {
        this.setState({ loading: false });
        return message.error(err || err.message);
      });
    }
  }

  handleAdd = async () => {
    const { data, customSelect, customFields } = this.props;
    const { name, cloudccid, selectCC } = this.state;
    if (name === '' || name.length === 0) {
      message.error('请先筛选结果选择一个值后再操作');
      return;
    }
    let allNewCustomFieldValue = [];
    if (customFields) {
      // customFields存在即创建，目前只在【创建单据】的时候有自动填充同一张表中其他字段的默认值的逻辑
      customFields && customFields.forEach(it => {
        if (it.cloudcc_key === data.cloudcc_key && selectCC[it.cloudcc_field]) {
          allNewCustomFieldValue.push(
            {
              customFieldId: it.id,
              parentId: 0,
              customLabel: selectCC[it.cloudcc_field] || name, // 这里注意添加多个的话需要填充的值要由selectCC[it.cloudcc_field]决定
              customValue: selectCC[it.cloudcc_field] || name,
              cloudccid: cloudccid
            }
          );
        }
      });
    } else {
      allNewCustomFieldValue.push(
        {
          customFieldId: data.id,
          parentId: 0,
          customLabel: name,
          customValue: name,
          cloudccid: cloudccid
        }
      );
    }

    const params = {
      data: allNewCustomFieldValue
    };
    const result = await batchAddCloudCC(params).then(res => {
      this.setState({ visible: false });
      if (res.code !== 200) return message.error(res.msg);
      return res.result || [];
    }).catch(err => {
      return message.error(err || err.message);
    });

    const newCustomSelect = deepCopy(customSelect);

    // 处理需要自动填充的逻辑
    if (customFields) {
      result && result.forEach(it => {
        const currentAlreadyArr = newCustomSelect[it.customfieldid] || [];
        const arr = newCustomSelect[it.customfieldid] || [];
        if (it && Object.keys(it).length && !currentAlreadyArr.some(i => i.id === it.id)) {
          arr.unshift(it);
          newCustomSelect[it.customfieldid] = arr;
        }
      });
      await this.props.dispatch({ type: 'aimEP/saveCustomSelect', payload: newCustomSelect });
      if (this.props.handleSave) {
        this.props.handleSave(result, newCustomSelect);
      }
    } else {
      //当前字段及对应新创建的值处理
      const arr = newCustomSelect[data.id] || [];
      const firstCustomFieldValue = result[0];
      if (firstCustomFieldValue && Object.keys(firstCustomFieldValue).length) {
        arr.unshift(firstCustomFieldValue);
        newCustomSelect[data.id] = arr;
      }
      await this.props.dispatch({ type: 'aimEP/saveCustomSelect', payload: newCustomSelect });
      //新增字段值的额外处理
      if (this.props.handleSave) {
        this.props.handleSave(firstCustomFieldValue.id, newCustomSelect);
      }
    }

    this.resetData();
  }

  handleCancel = () => {
    this.resetData();
  }

  handleSelect = (name, id, item) => {
    this.setState({
      name: name,
      cloudccid: id,
      selectCC: item,
    });
  }

  render() {
    const { visible, value, result, loading } = this.state;
    const { data } = this.props;

    return (<span>
      <a onClick={(e) => { this.setState({ visible: true }); this.queryCloudCC() }}>从CloudCC中查询</a>
      <Modal
        visible={visible}
        title="从CloudCC中查询"
        onCancel={() => this.handleCancel()}
        onOk={() => this.handleAdd()}
        destroyOnClose
        maskClosable={false}
      >
        <Spin spinning={loading}>
          <Search
            placeholder="请输入"
            enterButton="查询"
            value={value}
            onChange={(e) => this.setState({ value: e.target.value, current: 1 })}
            onSearch={value => this.queryCloudCC(value)}
            autoFocus
          />

          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <RadioGroup>
              {
                result.data && result.data.map(item => (<div style={{ height: '30px', lineHeight: '30px' }}>
                  <Radio key={item.id} value={item.id} onChange={() => this.handleSelect(item[data.cloudcc_field] ? item[data.cloudcc_field] : item.name, item.id, item)}>
                    {item[data.cloudcc_field] ? item[data.cloudcc_field] : item.name}
                  </Radio>
                </div>
                ))
              }
            </RadioGroup>
          </div>
          <Pagination
            current={this.state.current}
            onChange={(current) => this.setState({ current }, () => this.queryCloudCC())}
            total={result.totalCount}
            pageSize={20}
          />
        </Spin>
      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
    customSelect: state.aimEP.customSelect,
  };
};

export default connect(mapStateToProps)(index);
