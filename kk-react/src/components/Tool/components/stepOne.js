import React, { Component } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Row, Col, Select, Checkbox, message, Upload, Input } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { getAllSubProductList } from '@services/product';
import { getFormLayout } from '@utils/helper';
import { readAdviseFile } from '@services/advise';
import { readRequirementFile } from '@services/requirement';
import { readTaskFile } from '@services/task';
import { readBugFile } from '@services/bug';
import { readObjectiveFile } from '@services/objective';
import { readTicketFile } from '@services/ticket';
import BusinessHOC from '@components/BusinessHOC';
import styles from './import.less';

const { Option } = Select;
const FormItem = Form.Item;
const formLayout = getFormLayout(4, 16);

class StepOne extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productList: [],
      fileList: [],
      productid: 0,
    };
  }

  componentDidMount() {
    const { lastProduct } = this.props;
    const productid = lastProduct && lastProduct.id;
    if (productid) {
      this.getProductList(productid);
      this.setState({ productid });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lastProduct.id !== this.props.lastProduct.id) {
      this.getProductList(nextProps.lastProduct.id);
      this.setState({ productid: nextProps.lastProduct.id });
    }
  }

  getProductList = (productid) => {
    getAllSubProductList(productid).then((res) => {
      if (res.code !== 200) return message.error('查询子产品失败', res.message);
      if (res.result) {
        this.setState({ productList: res.result });
      }
    }).catch((err) => {
      return message.error('查询子产品异常', err || err.message);
    });
  }


  setCurrent = (val) => {
    if (val === 1) {
      this.nextStep(val);
    } else if (val === -1) {
      router.go(-1);
    }
  }

  nextStep = (val) => { //读取文件
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { fileList } = this.state;
      if (!fileList.length) {
        return message.warning('请选择文件');
      }
      const formData = new FormData();
      for (let i in values) {
        if (i === 'file') {
          formData.append('file', fileList[0]);
        } else {
          formData.append(i, values[i]);
        }
      }
      const { productid } = this.state;
      formData.append('productId', productid);

      const { key } = this.props.type;
      if (key === 'advise') {
        readAdviseFile(formData).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          this.props.setCurrent(val, res.result);
        }).catch((err) => {
          return message.error(`${err || err.msg}读取文件异常`);
        });
      } else if (key === 'requirement') {
        readRequirementFile(formData).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          this.props.setCurrent(val, res.result);
        }).catch((err) => {
          return message.error(`${err || err.msg}读取文件异常`);
        });
      }
      else if (key === 'task') {
        readTaskFile(formData).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          this.props.setCurrent(val, res.result);
        }).catch((err) => {
          return message.error(`${err || err.msg}读取文件异常`);
        });
      }
      else if (key === 'bug') {
        readBugFile(formData).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          this.props.setCurrent(val, res.result);
        }).catch((err) => {
          return message.error(`${err || err.msg}读取文件异常`);
        });
      }
      else if (key === 'objective') {
        readObjectiveFile(formData).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          this.props.setCurrent(val, res.result);
        }).catch((err) => {
          return message.error(`${err || err.msg}读取文件异常`);
        });
      }
      else if (key === 'ticket') {
        readTicketFile(formData).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          this.props.setCurrent(val, res.result);
        }).catch((err) => {
          return message.error(`${err || err.msg}读取文件异常`);
        });
      }

    });
  }


  downloadTemplate = () => {
    const { type } = this.props;
    const { productid } = this.state;
    window.open(
      `${window.location.origin}/rest/${type.key}/export/template?productId=${productid}`
    );
    // window.open(
    //   `${window.location.origin}/res/template/${type.key}_import_template.xlsx?t=${new Date()}`
    // );
  }


  render() {
    const { productList, fileList } = this.state;
    const { getFieldDecorator } = this.props.form;
    const props = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        if (this.state.fileList.length > 0) {
          return message.warning(`最多只能上传一个文件!`);
        }
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <div className={styles.contentFirst}>
        <span className={styles.downLoad}>
          请先使用导入数据模版完成导入，
          <a onClick={() => this.downloadTemplate()}>下载导入模版</a>
        </span>
        <div style={{ marginTop: '10px' }}>
          {/* <FormItem label="导入数据到子产品" {...formLayout}>
            {getFieldDecorator('subProductId', {
              initialValue: String((productList && productList[0] && productList[0].id) || ''),
              rules: [{ required: true, message: '子产品必选!' }]
            })(
              <Select style={{ width: 280 }}>
                {productList.map(it => (
                  <Option key={it.id} vlaue={it.id}>{it.subProductName}</Option>
                ))}
              </Select>,
            )}
          </FormItem> */}
        </div>
        <div style={{ marginTop: '10px' }}>
          <FormItem label={
            <span>
              <span className='needIcon'>*</span>
                数据文件(.xls,xlsx)
            </span>
          } {...formLayout}>
            <Upload {...props} accept='.xls,.xlsx'>
              <Button>
                <UploadOutlined /> 选择文件
              </Button>
            </Upload>
          </FormItem>

          {getFieldDecorator('file', {
          })(
            <Input style={{ display: 'none' }} />
          )}
        </div>

        <Row style={{ marginTop: '10px' }}>
          <Col span={4}></Col>
          {!this.props.isBusiness && <FormItem label="" {...formLayout}>
            {getFieldDecorator('hasJiraKey', {
              initialValue: true,
              valuePropName: 'checked',
            })(
              <Checkbox>数据文件中的JIRA单子列为必填</Checkbox>
            )}
          </FormItem>}
        </Row>
        <Row style={{ marginTop: '40px' }} className='f-tar btn98'>
          <Button type='primary' onClick={() => this.setCurrent(1)}>预览</Button>
          <Button className='u-mgl10' onClick={() => this.setCurrent(-1)}>返回</Button>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(BusinessHOC()(StepOne)));
