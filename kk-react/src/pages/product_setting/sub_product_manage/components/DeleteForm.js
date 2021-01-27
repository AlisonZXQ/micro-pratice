import React, { Component } from 'react';
import { Select } from 'antd';
import { withRouter } from 'react-router-dom';
import { DEFAULT_SUB_PRODUCT } from '@shared/ProductSettingConfig';

const Option = Select.Option;

class DeleteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { form: { getFieldDecorator }, subProductAll, record } = this.props;
    const currentId = record.id;
    const defaultObj = subProductAll.find(it => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT) || {};
    const subProductList = subProductAll.filter(it => it.id !== currentId);

    return (
      <span>
        <span>当前子产品相关数据将迁移至：</span>
        {
          getFieldDecorator('toProduct', {
            initialValue: defaultObj.id,
          })(
            <Select
              showSearch
              showArrow={false}
              placeholder="请输入子产品搜索"
              style={{ width: '150px' }}
            >
              {
                subProductList.map(it =>
                  <Option key={it.id} value={it.id}>
                    {it.subProductName}
                  </Option>)
              }
            </Select>
          )
        }
      </span>
    );
  }
}

export default withRouter(DeleteForm);
