import React, { Component } from 'react';
import { Button, Card } from 'antd';
import { history } from 'umi';
import styles from './index.less';

class index extends Component {

  render() {
    return (<div className="u-mg15">
      <Card>
        <div className={styles.utip}>退出系统成功</div>
        <div className="f-tac u-mgt10">
          <Button type="primary" onClick={() => history.push('/')}>回到首页</Button>
        </div>
      </Card>
    </div>);
  }
}

export default index;
