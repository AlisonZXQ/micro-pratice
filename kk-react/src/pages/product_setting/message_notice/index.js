import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Tabs } from 'antd';
import { connect } from 'dva';
import AdviseTicketWarning from './components/AdviseTicketWarning';
import NoticeConfig from './components/NoticeConfig';
import WarningConfig from './components/WarningConfig';
import styles from './index.less';

const { TabPane } = Tabs;

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { lastProduct } = this.props;
    return (<span className={styles.noticeSetting}>
      <div className={`settingTitle ${styles.settingTitle}`}>
        {lastProduct.name}-通知和预警
      </div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="通知配置" key="1">
          {lastProduct && lastProduct.id && <span>
            <NoticeConfig
              form={this.props.form}
              productid={lastProduct.id}
            />
          </span>}
        </TabPane>
        <TabPane tab="预警配置" key="2">
          {lastProduct && lastProduct.id && <span>
            <WarningConfig
              form={this.props.form}
              productid={lastProduct.id}
            />
            <AdviseTicketWarning
              form={this.props.form}
              productid={lastProduct.id}
              type='advise'
            />
            <AdviseTicketWarning
              form={this.props.form}
              productid={lastProduct.id}
              type='ticket'
            />
          </span>}
        </TabPane>
      </Tabs>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
