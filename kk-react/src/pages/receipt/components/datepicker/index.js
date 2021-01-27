import React, { Component } from 'react';
import { DatePicker, message, Divider } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { CUSTOME_REQUIRED } from '@shared/ReceiptConfig';
import styles from './index.less';

const dateFormat = 'YYYY-MM-DD';

class index extends Component {
  state = {
    edit: false,
    newValue: '',
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.drawerIssueId !== prevProps.drawerIssueId) {
      this.setState({ edit: false });
    }
  }

  handleSave = (value) => {
    const { data, type, required } = this.props;
    if ((required || (data && data.required === CUSTOME_REQUIRED.REQUIRED)) && !value) {
      return message.error('此项必填！');
    }
    let newDate = value ? moment(value).format(dateFormat) : '';
    if (type === 'dueDate') {
      newDate = value ? moment(value).valueOf() : 0;
    }
    this.props.handleSave(newDate);
    this.setState({ edit: false });
  }

  render() {
    const { value, issueRole } = this.props;
    const { edit, newValue } = this.state;

    return (<span>
      {issueRole === ISSUE_ROLE_VALUE_MAP.READ &&
        <div
          className={'u-subtitle'}
          style={{ wordBreak: 'break-all' }}
        >{value ? moment(value).format(dateFormat) : <span className="u-placeholder">请选择</span>}
        </div>
      }

      {
        issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
        <span className={"f-csp"} id="u-datepicker">
          {
            !edit &&
            [<div
              className={'editIssue u-subtitle'}
              onClick={() => this.setState({ edit: true })}
              style={{ wordBreak: 'break-all' }}
            >{value ? moment(value).format(dateFormat) : <span className="u-placeholder">请选择</span>}
            </div>]
          }
          {
            edit &&
            [<DatePicker
              defaultValue={value ? moment(value) : undefined}
              className={styles.datePicker}
              onChange={(value) => { this.setState({ newValue: moment(value).valueOf() }) }}
              placeholder="点击选择日期"
              suffixIcon={<MyIcon type='icon-xia' className={styles.icon} />}
              getCalendarContainer={(triggerNode) => triggerNode.parentNode}
            />, <div>
              <a size="small" type="primary" onClick={() => this.handleSave(newValue)}>保存</a>
              <Divider type="vertical" />
              <a size="small" onClick={() => this.setState({ edit: false, newValue: value })}>取消</a>
            </div>]
          }
        </span>
      }

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default connect(mapStateToProps)(index);
