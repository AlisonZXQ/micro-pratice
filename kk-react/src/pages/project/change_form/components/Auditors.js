import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { queryUser } from '@services/project';

const formLayout = getFormLayout(5, 13);
const FormItem = Form.Item;
const Option = Select.Option;

// 废弃
class Auditors extends Component {
  state = {
    firstViewList: [],
    secondViewList: [],
  }

  componentDidMount() {
    this.getDefaultData(this.props.projectBegin);
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (Object.keys(nextProps.projectBegin).length !== 0 && this.props.projectBegin !== nextProps.projectBegin) {
      this.getDefaultData(nextProps.projectBegin);
    }
  }

  getDefaultData = (projectBegin) => {
    if (projectBegin && projectBegin.workflowNodes && projectBegin.workflowNodes[1]) {
      this.setState({ firstViewList: [projectBegin.workflowNodes[1].operator] });
    }
    if (projectBegin && projectBegin.workflowNodes && projectBegin.workflowNodes[2]) {
      this.setState({ secondViewList: [projectBegin.workflowNodes[2].operator] });
    }
  }

  handleSearch = (value, type) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          if (type === 'firstView') {
            this.setState({ firstViewList: res.result });
          } else {
            this.setState({ secondViewList: res.result });
          }
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  render() {
    const { form: { getFieldDecorator }, projectBegin } = this.props;
    const { firstViewList, secondViewList } = this.state;

    const firstViewId = projectBegin && projectBegin.workflowNodes && projectBegin.workflowNodes[1] && projectBegin.workflowNodes[1].operator.id;
    const secondViewId = projectBegin && projectBegin.workflowNodes && projectBegin.workflowNodes[2] && projectBegin.workflowNodes[2].operator.id;

    return (
      <span>
        <FormItem label="初审人" {...formLayout} className="u-mgt10">
          {getFieldDecorator('preReviewer', {
            initialValue: firstViewId,
            rules: [{ required: true, message: '此项必填！' }],
          })(
            <Select
              showSearch
              placeholder="请选择"
              filterOption={false}
              onSearch={(value) => this.handleSearch(value, 'firstView')}
              style={{ width: '100%' }}
            >
              {firstViewList && firstViewList.map(it => (
                <Option key={it.id} value={it.id}>{it.realname || it.name} {it.email}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="复审人" {...formLayout}>
          {getFieldDecorator('reReviewer', {
            initialValue: secondViewId,
            rules: [{ required: true, message: '此项必填！' }],
          })(
            <Select
              showSearch
              placeholder="请选择"
              filterOption={false}
              onSearch={(value) => this.handleSearch(value, 'secondView')}
              style={{ width: '100%' }}
            >
              {secondViewList && secondViewList.map(it => (
                <Option key={it.id} value={it.id}>{it.realname || it.name} {it.email}</Option>
              ))}
            </Select>
          )}
        </FormItem>
      </span>);
  }
}

export default Auditors;
