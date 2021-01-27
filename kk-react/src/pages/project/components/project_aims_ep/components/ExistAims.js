import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, Input, message } from 'antd';
import debounce from 'lodash/debounce';
import { getFormLayout } from '@utils/helper';
import { getAimBySearchEP } from '@services/project';
import styles from '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formLayout = getFormLayout(2, 21);

class ExistAims extends Component {
  state = {
    aimList: [],
  };

  handleSelect = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ exist: data.props.data });
  }

  handleSearch = debounce((value) => {
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
  }, 800)

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

      <FormItem label="标题" {...formLayout} className="f-tac">
        <Select
          showSearch
          placeholder="请输入目标标题"
          filterOption={false}
          onChange={this.handleSelect}
          onSearch={(value) => this.handleSearch(value)}
          notFoundContent={'暂无数据'}
          showArrow={false}
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
