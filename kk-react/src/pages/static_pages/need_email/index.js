import React, { Component } from 'react';
import { Button, Card } from 'antd';
import styles from './index.less';

class index extends Component {

  render() {
    return (<div className="u-mg15">
      <Card>
        <div className={styles.utip}>你的账号暂未配置邮箱，暂时无法使用项目管理平台，请先配置账号邮箱！</div>
        <div className="f-tac u-mgt10">
          <Button type="primary">
            <a href={`https://www.njdiip.com/userInfo`}>
              去设置
            </a>
          </Button>
        </div>
      </Card>
    </div>)
  }
}

export default index;
