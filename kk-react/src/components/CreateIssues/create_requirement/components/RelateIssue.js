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
    const { requirementDetail } = this.props;
    const jirakey = (requirementDetail && requirementDetail.jirakey) || '';
    const { getFieldDecorator, getFieldValue } = this.props.form;

    return (<span>
      <div className={styles.relateIssue}>
        <span style={{ marginLeft: '12px' }}>关联JIRA需求</span>
      </div>
      <div className={styles.jiraTip}>
        <span>
          设置关联JIRA需求后，对应的JIRA单子与EP的需求单将双向绑定，字段与状态将在绑定后再编辑时进行同步。
        </span>
        <span className='u-mgt5'>
          默认不配置关联JIRA需求情况下，EP将自动创建一个EP需求单的副本进行同步。
        </span>
      </div>
      <FormItem className='u-mgt10' label="当前关联的jira需求" {...formLayout}>
        {
          getFieldDecorator('jirakey', {
            initialValue: jirakey,
          })(
            <JiraList
              productid={getFieldValue('productid')}
              form={this.props.form}
              issuetype={ISSUE_TYPE_JIRA_MAP.REQUIREMENT}
            />
          )
        }
      </FormItem>
    </span>);
  }
}

export default RelateIssue;
