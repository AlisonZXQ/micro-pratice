import React, { Component } from 'react';
import { Popover } from 'antd';
import styles from './index.less';

class index extends Component {

  isEmpty = (text) => {
    return text ? text : '-';
  }

  getOldValue = () => {
    const { oldvalue } = this.props;
    return <div>
      <span className={styles.oldColor}>原始值：</span>
      <span>{this.isEmpty(oldvalue)}</span>
    </div>;
  }

  render() {
    const { newvalue, oldvalue } = this.props;

    return (<span>
      {
        oldvalue === 'ZXQ-nochange' ?
          newvalue
          :
          <Popover content={this.getOldValue()}>
            {
              newvalue
            }
          </Popover>
      }

    </span>);
  }
}

export default index;
