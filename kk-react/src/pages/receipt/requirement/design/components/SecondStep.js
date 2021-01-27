import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Col, Card } from 'antd';
import { equalsObj } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { DESIGN_TYPE } from '@shared/RequirementConfig';
import ProductDesign from './second_components/ProductDesign';
import SpreadDesign from './second_components/SpreadDesign';
import BrandDesign from './second_components/BrandDesign';
import DetailDesign from './second_components/DetailDesign';
import LookDesign from './second_components/LookDesign';
import PhotoDesign from './second_components/PhotoDesign';
import { typeDes, plainOptions } from './shared/Config';
import styles from '../index.less';

const FormItem = Form.Item;

class SecondStep extends Component {
  state = {
    select: DESIGN_TYPE.PRODUCT_DESIGN,
  }

  componentDidMount() {
    const { data } = this.props;
    if (data) {
      const type = data.designType;
      this.setState({ select: type });
    }

  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      const type = nextProps.data.designType;
      this.setState({ select: type });
    }
  }

  handleClick = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ designType: value });
    this.setState({ select: value });
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, data } = this.props;
    const { select } = this.state;

    return (<Form className="u-form">
      <Card className={styles.topCardStyle}>
        <div className={styles.designTitle}>设计类型</div>
        <ul className={styles.ul}>
          {
            plainOptions && Object.keys(plainOptions).map(it =>
              <li
                className={styles.li}
                onClick={() => this.handleClick(Number(it))}>
                <div
                  className={`${styles.designStyle} ${select === Number(it) ? styles.select : styles.unSelect}`}
                >
                  <div className={`${styles.title} ${select === Number(it) ? styles.selectTitle : styles.unSelectTitle}`}>{plainOptions[Number(it)]}</div>
                  <div className={`${styles.contentCard} ${select === Number(it) ? styles.selectContentCard : styles.unSelectContentCard}`}>{typeDes[Number(it)]}</div>
                </div>

                <div className={styles.arrowContainer}>
                  {
                    select === Number(it) &&
                    <MyIcon type="icon-shang" className={styles.arrow} />
                  }
                </div>
              </li>)
          }
        </ul>
        <FormItem style={{ marginBottom: '0px' }}>
          {
            getFieldDecorator('designType', {
              initialValue: (data && data.designType) ? data.designType : DESIGN_TYPE.PRODUCT_DESIGN,
            })(
              <Input style={{ display: 'none' }} />
            )
          }
        </FormItem>
      </Card>
      <div className={styles.designTitle} style={{ marginLeft: '40px' }}>具体要求及评估</div>
      <Col offset={2} span={20}>
        {
          getFieldValue('designType') === DESIGN_TYPE.PRODUCT_DESIGN && <ProductDesign form={this.props.form} {...this.props} />
        }
        {
          getFieldValue('designType') === DESIGN_TYPE.SPREAD_DESIGN && <SpreadDesign form={this.props.form} {...this.props} />
        }
        {
          getFieldValue('designType') === DESIGN_TYPE.BRAND_DESIGN && <BrandDesign form={this.props.form} {...this.props} />
        }
        {
          getFieldValue('designType') === DESIGN_TYPE.DETAIL_DESIGN && <DetailDesign form={this.props.form} {...this.props} />
        }
        {
          getFieldValue('designType') === DESIGN_TYPE.LOOK_DESIGN && <LookDesign form={this.props.form} {...this.props} />
        }
        {
          getFieldValue('designType') === DESIGN_TYPE.PHOTO_DESIGN && <PhotoDesign form={this.props.form} {...this.props} />
        }
        <div style={{ height: '20px' }}></div>
      </Col>

    </Form>);
  }
}

export default SecondStep;
