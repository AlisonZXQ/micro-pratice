import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Button, Card, message, Spin } from 'antd';
import { history } from 'umi';
import { connect } from 'dva';
import moment from 'moment';
import { updateProject, getEditProject, update4Projectchange } from '@services/project';
import EditInfo from './components/EditInfo';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editData: {},
      loading: false,
      saveLoading: false,
    };
  }

  componentDidMount() {
    const { id } = this.props.location.query;
    sessionStorage.setItem('currentPid', id);
    this.getEditData();
  }

  getEditData = () => {
    const { id } = this.props.history.location.query;
    this.setState({ loading: true });
    getEditProject(id).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ editData: res.result });
        const productid = res.result.product && res.result.product[0] && res.result.product[0].id;
        // 获取级联列表数据
        this.getCascadeList(productid);
        this.props.dispatch({ type: 'createProject/saveProductList', payload: res.result.product });
      }
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(err || err.msg);
    });
  }

  getCascadeList = (id) => {
    const params = {
      productid: id,
      type: 1,
    };
    this.props.dispatch({ type: 'projectCascade/getCascadeList', payload: params });
  }

  handleSave = (params) => {
    const { pathname } = window.location;
    const { editData } = this.state;
    this.setState({ saveLoading: true });
    let promise = null;
    if (pathname.includes('change_project')) {
      promise = update4Projectchange(params);
    } else {
      promise = updateProject(params);
    }

    promise.then((res) => {
      this.setState({ saveLoading: false });
      if (res.code !== 200) return message.error(`更新项目失败, ${res.msg}`);
      message.success('更新项目成功');
      history.push(`/project/detail?id=${editData.id}`);
    }).catch((err) => {
      this.setState({ saveLoading: false });
      return message.error('更新项目异常', err || err.msg);
    });
  }

  handleUpdate = () => {
    const { id } = this.props.location.query;
    const { editData } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;

      const cascadeValueInfoList = editData.cascadeValueInfoList || [];
      // 级联值
      const cascadeValues = [];
      for (let i in values) {
        if (i.includes('cascadeField') && values[i]) {
          values[i].map(item => {
            const cascadeValueObj = cascadeValueInfoList.find(it => it.cascadeCategory && it.cascadeCategory.id === Number(item)) || {};
            const cascadeValue = cascadeValueObj.cascadeValue || {};
            cascadeValues.push({
              type: 1, // 1项目 2单据
              resourceid: id, // 创建时项目id是0
              cascadefieldid: i.split('-')[1],
              categoryid: item,
              id: cascadeValue.id || 0,
            });
          });
        }
      }

      const createCustomFields = []; // 自定义字段
      for (let i in values) {
        if (i.includes('custom')) {
          const obj = (editData &&
            editData.createCustomFileds.find(it => it.customFieldId === Number(i.substring(7))));
          createCustomFields.push({
            customFieldId: i.substring(7),
            id: obj.id,
            value: values[i],
            templateId: values.templateId,
            projectId: editData.id,
          });
        }
      }

      // 可以直接从values拿到的字段不需处理
      const sameWords = ['ownerId', 'templateId', 'priority', 'budget', 'departmentId', 'subProductId'];
      const sameObj = {};
      sameWords.map(it => {
        sameObj[it] = values[it];
      });

      const params = {
        ...sameObj,
        title: editData.title,
        description: editData.description,
        startTime: values.timeRange && values.timeRange[0] && moment(values.timeRange[0]).format('YYYY-MM-DD'),
        endTime: values.timeRange && values.timeRange[1] && moment(values.timeRange[1]).format('YYYY-MM-DD'),
        createCustomFields,
        id: editData.id,
        productIds: editData.product && editData.product.map(it => it.id),
        managerIds: values.managerIds ? [values.managerIds] : [],
        cascadeValues,
      };
      this.handleSave(params);
    });
  }

  render() {
    const { id } = this.props.location.query;
    const { editData, loading, saveLoading } = this.state;
    return (<div className="u-mg15">
      <Spin spinning={loading}>
        <div className='bbTitle'><span className='name'>编辑项目</span></div>
        <Card>
          <Row className="u-pdt20 u-pdb20">
            <Col offset={5} span={12}>
              <EditInfo
                form={this.props.form}
                {...this.props}
                editData={editData}
              />
              <div className="f-tar btn98">
                <Button className="u-mgr10" type="primary"
                  onClick={() => this.handleUpdate()}
                  loading={saveLoading}
                >更新
                </Button>
                <Button onClick={() => history.push(`/project/detail?id=${id}`)}>取消</Button>
              </div>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    userList: state.project.userList,
    cascadeList: state.projectCascade.cascadeList, // 级联列表
    categoryObj: state.projectCascade.categoryObj,
  };
};
export default connect(mapStateToProps)(Form.create()(index));

