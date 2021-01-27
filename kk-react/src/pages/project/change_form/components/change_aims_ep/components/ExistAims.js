import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, Input, message } from 'antd';
import debounce from 'lodash/debounce';
import { getAimBySearchEP } from '@services/project';
import styles from '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;

class ExistAims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      aimList: [],
    };
    this.handleSearch = debounce(this.handleSearch, 800);
  }

  handleSelect = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ exist: data.props.data });
  }

  handleSearch = (value) => {
    const { productByUser } = this.props;
    if (value.length && productByUser && productByUser.length) {
      const params = {
        name: value,
        productid: productByUser && productByUser.map(it => it.id) && productByUser.map(it => it.id).join(','),
        offset: 0,
        limit: 200,
      };

      getAimBySearchEP(params).then((res) => {
        if (res.code !== 200) return message.error('查询已有目标失败', res.message);
        if (res.result) {
          this.setState({ aimList: res.result });
        }
      }).catch((err) => {
        return message.error('查询已有目标异常', err || err.message);
      });
    }
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { aimList } = this.state;

    return (<Form className={styles.createStyle}>
      <FormItem>
        {getFieldDecorator('exist', {
        })(
          <Input style={{ display: 'none' }} />,
        )}
      </FormItem>

      <FormItem className="u-mgt40 f-tac">
        <Select
          showSearch
          style={{ width: '80%' }}
          placeholder="请输入Epic标题"
          filterOption={false}
          onChange={this.handleSelect}
          onSearch={(value) => this.handleSearch(value)}
          notFoundContent={'暂无数据'}
        >
          {
            aimList && aimList.map(item => (
              <Option key={item.id} value={item.id} data={item}>
                <span>{item.summary}</span>
              </Option>
            ))
          }
        </Select>
      </FormItem>
    </Form>
    );
  }
}
export default ExistAims;
