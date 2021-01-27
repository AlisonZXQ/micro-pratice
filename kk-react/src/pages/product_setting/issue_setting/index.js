import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Tabs } from 'antd';
import { connect } from 'dva';
import CustomManage from './components/custom_manage';
import Split from './components/split';
import styles from './index.less';

const { TabPane } = Tabs;

class Index extends Component {
  state = {
    value: 'custom',
  }

  render() {
    const { lastProduct } = this.props;
    const { value } = this.state;

    return (<span className={styles.issueSetting}>
      <div className={`settingTitle ${styles.settingTitle}`}>
        {lastProduct.name}-单据配置
      </div>
      <Tabs defaultActiveKey={`custom`} onChange={value => this.setState({ value })}>
        <TabPane tab="自定义字段" key="custom">
        </TabPane>
        <TabPane tab="拆单方案" key="plan">
        </TabPane>
      </Tabs>
      {
        value === 'custom' &&
        <span>
          {lastProduct && lastProduct.id &&
            <CustomManage
              productid={lastProduct.id}
            />}
        </span>
      }

      {
        value === 'plan' &&
        <span>
          {lastProduct && lastProduct.id &&
            <Split
              form={this.props.form}
              productid={lastProduct.id}
            />
          }
        </span>
      }

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
