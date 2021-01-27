import React, { Component } from 'react';
import { Link } from 'umi';
import { Card } from 'antd';
import MyIcon from '@components/MyIcon';
import TabsNew from '@components/Tabs';
import { issueTypeArr, headerTabs } from '@shared/ProductSettingConfig';
import JiraToEp from './components/JiraToEp';
import EpToJira from './components/EpToJira';
import styles from './index.less';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeHeader: 1,
      activeKey: 10209,
    };
  }

  componentDidMount() {

  }

  handleChangeHeader = (value) => {
    this.setState({
      activeHeader: value,
      activeKey: 10209
    });
  }

  render() {
    const { productid, subProductName } = this.props.location.query;
    const { activeKey, activeHeader } = this.state;

    return (<span className={styles.container}>
      <Card>
        <div className="u-mgt10">
          <Link to={`/product_setting/subProduct?productid=${productid}`} className="u-subtitle u-mgl15">
            <span>
              <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
              返回
            </span>
          </Link>
        </div>

        <div className={`${styles.header} u-mgb10`}>
          <MyIcon type="icon-danhaoicon" className={styles.icon} />
          当前产品【{subProductName}】下的JIRA与EP状态映射表
        </div>

        <TabsNew
          tabsData={headerTabs}
          defaultKey={activeHeader}
          callback={this.handleChangeHeader}
        />
      </Card>

      <div style={{ padding: '0px 20px' }}>
        <div className="bbTitle">
          <span className="name">
            映射列表
          </span>
        </div>

        <Card>
          <TabsNew
            tabsData={issueTypeArr}
            defaultKey={activeKey}
            callback={(value) => this.setState({ activeKey: value })}
            className={styles.tabs}
          />
          {
            activeHeader === 1 ?
              <JiraToEp
                activeKey={activeKey}
              />
              :
              <EpToJira
                activeKey={activeKey}
              />
          }
        </Card>
      </div>

    </span>);
  }
}

export default index;
