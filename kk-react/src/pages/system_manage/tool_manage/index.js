import React, { Component } from 'react';
import { Card } from 'antd';
import Tabs from '@components/Tabs';
import BusinessHOC from '@components/BusinessHOC';
import { tabsDataNet, tabsDataBusiness } from '@shared/SystemManageConfig';
import ProductApply from './components/ProductApply';
import EntApply from './components/EntApply';
import PlatNotice from './components/PlatNotice';
import CascaderSetting from './components/cascader_setting';
import styles from './index.less';

class index extends Component {
  state = {
    activeKey: 'product',
  }

  componentDidMount() {
    const { type } = this.props.location.query;
    if (type) {
      if (type === 'apply') {
        this.setState({ activeKey: 'product' });
      } else if (type === 'entapply') {
        this.setState({ activeKey: 'enterprise' });
      }
    }
  }

  callback = (key) => {
    this.setState({ activeKey: key });
  }

  render() {
    const { isBusiness } = this.props;
    const { activeKey } = this.state;

    return (<span>
      <Card className={styles.container}>
        <Tabs
          tabsData={isBusiness ? tabsDataBusiness : tabsDataNet}
          defaultKey={activeKey}
          callback={this.callback}
        />
      </Card>

      <Card className="u-mgt20 u-mgl15 u-mgr15">
        {
          activeKey === 'product' && <ProductApply />
        }
        {
          activeKey === 'enterprise' && <EntApply />
        }
        {
          activeKey === 'platform' && <PlatNotice />
        }
        {
          activeKey === 'cascader' && <CascaderSetting />
        }
      </Card>
    </span>);
  }
}

export default BusinessHOC()(index);
