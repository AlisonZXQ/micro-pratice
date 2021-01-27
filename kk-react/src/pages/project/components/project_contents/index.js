import React, { Component } from 'react';
import { Button, Modal, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { updatePlanning, getPersonInProjectFlag } from '@services/project';
import { PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import TransferContents from './components/TransferContent';
import EpTransferContents from './components/EpTransferContents';
import styles from './index.less';

class index extends Component {
  state = {
    visible: false,
    items: [],
    keys: [],
    epitems: [],
    loading: false,
    popVisible: false,
  };

  componentDidMount() {
  }

  handleModal = () => {
    this.setState({ visible: true });
    // 穿梭框数据预处理productList（当前选择的子产品）productByUser（用户有权限的产品列表）
    const { dataType, edit, productList, productByUser, projectBasic } = this.props;
    const datasourceCreate = productList && productList[0] && productList[0].datasource;
    const datasourceHome = projectBasic && projectBasic.projectDetail && projectBasic.projectDetail.datasource;

    const productIds = productByUser && productByUser.map(it => it.id);

    // 已创建的从projectDetail中拿datasource
    if (dataType === 'all' && edit) {
      //
    }
    const params = {
      productList: productIds,
      datasource: datasourceCreate || datasourceHome,
    };

    this.props.dispatch({ type: 'project/getIssueCondition', payload: params });

  }

  // 这里只要在子组件中调用就会重新更新
  handleItems = (items) => {
    this.setState({ items });
  }

  handleKeys = (keys) => {
    this.setState({ keys });
  }

  handleEpItems = (items) => {
    this.setState({ epitems: items });
  }

  handleOk = (issueRole2ProjectMember) => {
    const { items, epitems } = this.state;
    const { dataType, edit, data, projectBasic } = this.props; // edit标志是否是更新

    if (dataType === 'all' && edit) {
      // 更新规划
      const params = {
        projectId: data && data.projectDetail && data.projectDetail.projectId,
        issueKeys: epitems.length > 0 ? epitems : items.map(it => it.issueKey),
        issueRole2ProjectMember
      };
      updatePlanning(params).then((res) => {
        if (res.code !== 200) return message.error('更新项目规划失败', res.msg);
        message.success('更新规划成功！');
        this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: data.projectDetail.projectId } });

        const paramsEdit = {
          projectId: data.projectDetail.projectId,
          products: projectBasic.products && projectBasic.products.map(it => it.id),
        };
        this.props.dispatch({ type: 'project/getProjectMember', payload: { id: data.projectDetail.projectId } });
        this.props.dispatch({ type: 'project/getPlanningData', payload: paramsEdit });
        this.setState({ loading: false, popVisible: false });
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error('更新项目规划失败', err || err.msg);
      });
    }

    // 规划内容
    if (dataType === 'all' && !edit) {
      this.props.dispatch({ type: 'createProject/saveAllContents', payload: items });
    }

    // part里程碑
    if (dataType === 'part') {
      this.props.dispatch({ type: 'createProject/savePartContents', payload: items });
      // 在model中只保存关联内容，其他的还是保存form
      this.props.updateProjectContents(items);
    }
    this.setState({ visible: false });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  getButtons = (type) => {
    const { disabled } = this.props;
    if (type === '关联单据') {
      return <Button className="u-mgr10" onClick={() => this.handleModal()} disabled={disabled}>添加工作项</Button>;
    } else {
      return <a onClick={() => this.handleModal()}>{type}</a>;
    }
  }

  getPersonInProjectFlag = () => {
    const { data } = this.props;
    const projectId = data && data.projectDetail && data.projectDetail.projectId;
    const { items, epitems } = this.state;
    const issueKeyList = epitems.length > 0 ? epitems : items.map(it => it.issueKey);
    const params = {
      projectId,
      issueKeyList,
    };
    this.setState({ loading: true });
    getPersonInProjectFlag(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ popVisible: true });
      } else {
        this.handleOk(false);
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { visible, keys, popVisible, loading } = this.state;
    const { type, dataType, productList, projectBasic } = this.props;

    const datasourceCreate = productList && productList[0] && productList[0].datasource;
    const datasourceHome = projectBasic && projectBasic.projectDetail && projectBasic.projectDetail.datasource;
    const datasource = datasourceCreate || datasourceHome;
    return (<span>
      <Modal
        closable={false}
        maskClosable={false}
        title={dataType === 'all' ? "项目规划" : '里程碑规划'}
        visible={visible}
        style={{ top: 0 }}
        width={'100%'}
        wrapClassName={styles.fullModal}
        okButtonProps={{ disabled: !!keys.length }}
        destroyOnClose
        footer={<span className='btn98'>
          <Button onClick={() => this.handleCancel()}>
            取消
          </Button>

          <Popconfirm
            title="是否将单据相关人员加入到项目中?"
            onConfirm={() => this.handleOk(true)}
            onCancel={() => this.handleOk(false)}
            okText="是"
            cancelText="否"
            visible={popVisible}
          >
            <Button
              type="primary"
              onClick={() => this.getPersonInProjectFlag()}
              loading={loading}
            >确定</Button>
          </Popconfirm>

        </span>}
      >
        {datasource === PROJECT_DATASOURCE.EP ?
          <EpTransferContents
            handleEpItems={this.handleEpItems}
            {...this.props}
          /> :
          <TransferContents
            handleItems={this.handleItems}
            handleKeys={this.handleKeys}
            {...this.props}
          />
        }
      </Modal>
      {
        this.getButtons(type)
      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    projectContents: state.createProject.projectContents,
    mileContents: state.createProject.mileContents,
    hasSelectContents: state.createProject.hasSelectContents,
    productList: state.createProject.productList, // 当前选择的产品-以前可以选择多个所以用了list，目前只有一个值
    productByUser: state.product.productList,
    issueCondition: state.project.issueCondition, // 筛选类型和状态
    projectBasic: state.project.projectBasic,
    selectSubProduct: state.createProject.selectSubProduct, // 当前选择的子产品
  };
};

export default connect(mapStateToProps)(index);

