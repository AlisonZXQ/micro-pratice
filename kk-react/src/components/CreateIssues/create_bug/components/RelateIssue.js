import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { getFormLayout } from '@utils/helper';
import JiraList from '@components/JiraList';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(4, 12);

class RelateIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (<span>
      <div className={styles.relateIssue}>
        <span style={{ marginLeft: '12px' }}>关联JIRA缺陷</span>
      </div>
      <div className={styles.jiraTip}>
        <span>
          设置关联JIRA缺陷后，对应的JIRA单子与EP的缺陷单将双向绑定，字段与状态将在绑定后再编辑时进行同步。
        </span>
        <span className='u-mgt5'>
          默认不配置关联JIRA缺陷情况下，EP将自动创建一个EP缺陷单的副本进行同步。
        </span>
      </div>
      <FormItem className='u-mgt10' label="当前关联的JIRA缺陷" {...formLayout}>
        {
          getFieldDecorator('jirakey', {
            initialValue: '',
          })(
            <JiraList
              form={this.props.form}
              issuetype={ISSUE_TYPE_JIRA_MAP.BUG}
            />
          )
        }
      </FormItem>
    </span>);
  }
}

export default RelateIssue;
