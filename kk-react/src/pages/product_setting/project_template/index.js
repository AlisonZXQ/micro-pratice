import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import TemplateList from './components/TemplateList';
import ConfigList from './components/ConfigList';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'template'
    };
  }

  createTemplate = () => {
    this.child.openTemplateDialog('', 'add');
  }

  createField = () => {
    this.child.openFieldDialog('', 'add');
  }

  onRef = (ref) => {
    this.child = ref;
  }

  render() {
    const { lastProduct } = this.props;
    const { show } = this.state;
    return (<span>
      <div className='settingTitle'>
        {lastProduct.name}-模板列表
      </div>
      {show === 'template' ? <div style={{ padding: '5px 16px 16px 16px' }}>
        <div className='bbTitle f-jcsb-aic'>
          <span className='name'>模板列表</span>
          <span>
            <Button className='u-mgr20' onClick={() => history.push(`/product_setting/approval_flow?productid=${lastProduct && lastProduct.id}`)}>配置审批流</Button>
            <Button className='u-mgr20' onClick={() => this.setState({ show: 'config' })}>配置项目自定义字段</Button>
            <Button type='primary' onClick={() => this.createTemplate()}>创建模板</Button>
          </span>
        </div>
        <div>
          {lastProduct && lastProduct.id && <TemplateList
            onRef={this.onRef}
            form={this.props.form}
            productid={lastProduct.id}
          />}
        </div>
      </div>:
        <div style={{ padding: '5px 16px 16px 16px' }}>
          <div className='bbTitle f-jcsb-aic'>
            <span className='name'>项目自定义字段</span>
            <span>
              <Button className='u-mgr20' onClick={() => this.setState({ show: 'template' })}>返回项目模板</Button>
              <Button type='primary' onClick={() => this.createField()}>创建新项目自定义字段</Button>
            </span>
          </div>
          <div>
            {lastProduct && lastProduct.id && <ConfigList
              onRef={this.onRef}
              form={this.props.form}
              productid={lastProduct.id}
            />}
          </div>
        </div>}
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
