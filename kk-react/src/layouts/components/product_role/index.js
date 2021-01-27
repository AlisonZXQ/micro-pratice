import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, message, Button, Checkbox, Spin, Row } from 'antd';
import { equalsObj } from '@utils/helper';
import { addUserProductRole } from '@services/product';
import styles from './index.less';

const CheckboxGroup = Checkbox.Group;

class index extends Component {

  state = {
    visible: false,
    roleList: [],
  }

  componentDidMount() {
    const { lastProduct } = this.props;

    if (lastProduct && lastProduct.id) {
      this.getAction(lastProduct);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.lastProduct, nextProps.lastProduct) && nextProps.lastProduct.id) {
      this.getAction(nextProps.lastProduct);
    }
  }

  getProductRole = (productObj) => {
    this.props.dispatch({ type: 'productSetting/getProductRole', payload: { productId: productObj.id } });
  }

  getAction = (productObj) => {
    const productRoleVOList = productObj.productRoleVOList || [];
    if (!productRoleVOList.length) {
      this.setState({ visible: true });
      this.getProductRole(productObj);
    }
  }

  handleOk = () => {
    const { lastProduct } = this.props;
    const { roleList } = this.state;

    const params = {
      productId: lastProduct.id,
      roleIdList: roleList,
    };
    addUserProductRole(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      message.success('岗位设置成功！');
      this.props.dispatch({ type: 'product/getUserProduct' });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { productRoleList, lastProduct, loading } = this.props;
    const { visible, roleList } = this.state;

    return (<span className={styles.container}>
      <Modal
        title={<span>设置岗位【{lastProduct && lastProduct.name}】</span>}
        visible={visible}
        maskClosable={false}
        onCancel={() => this.setState({ visible: false })}
        closable={false}
        keyboard={false}
        footer={<div>
          <Button onClick={() => this.handleOk()} type="primary" disabled={!roleList.length}>
            确定
          </Button>
        </div>}
      >
        <Spin spinning={loading}>
          <Row>
            <CheckboxGroup onChange={(value) => this.setState({ roleList: value })}>
              {
                productRoleList && productRoleList.map(it =>
                  <Checkbox key={it.id} value={it.id} style={{ marginLeft: '0px' }}>
                    {it.roleName}
                  </Checkbox>
                )
              }
            </CheckboxGroup>
          </Row>
        </Spin>
      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    productRoleList: state.productSetting.productRole,
    lastProduct: state.product.lastProduct,
    loading: state.loading.effects['productSetting/getProductRole'],
  };
};

export default connect(mapStateToProps)(index);
