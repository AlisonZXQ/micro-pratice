import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Modal, message, Empty, Spin, Menu, Popover } from 'antd';
import { connect } from 'dva';
import { Link } from 'umi';
import debounce from 'lodash/debounce';
import DropDown from '@components/CustomAntd/drop_down';
import TextOverFlow from '@components/TextOverFlow';
import DefineDot from '@components/DefineDot';
import OrderTime from '@components/OrderTime';
import MyIcon from '@components/MyIcon';
import CollectStar from '@components/CollectStar';
import { queryProjectList, projectOwnerList, projectCreatorList, closeProject, finishProject, projectBelongSubProductList, addCollectProject, cancelCollectProject, queryProjectListDetail } from '@services/project';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { PROJECT_STATUS_MAP, PROJECT_STATUS_EXCLUDE_FINISH } from '@shared/ProjectConfig';
import { warnModal } from '@shared/CommonFun';
import QueryArea from './components/QueryArea';
import FinishProject from '../project_detail/components/FinishProject';
import { statusMap, statusColor } from '@shared/ProjectConfig';
import styles from './index.less';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterObj: {
        productV2: [],
        status: [],
      },
      order: 2,
      orderField: 1,
      pagination: {
        current: 1
      },
      orderFieldData: [
        { name: '创建时间', key: 1 },
        { name: '截止时间', key: 2 },
      ],
      orderData: [
        { name: '升序', key: 1 },
        { name: '降序', key: 2 },
      ],
      ownerList: [],
      creatorList: [],
      productList: [],
      data: [],
      dataDetail: [],
      loading: false,
      visible: false,
      record: {}, // 结项用
    };
    this.getProjectList = debounce(this.getProjectList, 800);
    this.columns = [{
      title: '',
      dataIndex: 'change',
      width: 10,
      render: (text, record) => {
        const { dataDetail } = this.state;
        const recordDetail = dataDetail.find(it => it.projectId === record.id) || {};
        return (
          recordDetail.changeStatus && <span>
            <Popover content="当前项目内容/目标已变更，请项目负责人发起审批" placement="topLeft">
              <MyIcon type="icon-tishigantanhaohuang" style={{ fontSize: '18px' }} />
            </Popover>
          </span>);
      }
    }, {
      title: '项目名称',
      dataIndex: 'title',
      width: '26vw',
      render: (text, record) => {
        return (<span className='f-aic'>
          <span>
            <MyIcon className="u-mgr10" type='icon-xiangmuliebiaoicon' style={{ fontSize: '38px' }} />
            <div className='f-ib'>
              <div className='f-fs2' style={{ paddingBottom: '1px' }}><TextOverFlow content={text} maxWidth={'20vw'} /></div>
              <div className='grayColor f-fs1' style={{ paddingTop: '1px' }}>
                <TextOverFlow content={record.description ? record.description : '-'} maxWidth={'20vw'} />
              </div>
            </div>
          </span>
        </span>);
      }
    }, {
      title: '代号',
      dataIndex: 'projectCode',
      render: (text) => {
        return text ? text : '-';
      }
    }, {
      title: '状态',
      dataIndex: 'status',
      render: (text, record) => {
        const { dataDetail } = this.state;
        const recordDetail = dataDetail.find(it => it.projectId === record.id) || {};
        const closeReason = recordDetail.projectClosureInforVO && recordDetail.projectClosureInforVO.closureResult
          ? recordDetail.projectClosureInforVO.closureResult : '-';
        return ([
          <DefineDot
            text={text}
            statusMap={statusMap}
            statusColor={statusColor}
            closeReason={text === PROJECT_STATUS_MAP.FINISH && `(${closeReason})`}
          />
        ]);
      },
    }, {
      title: '优先级',
      dataIndex: 'priority',
      render: (text) => {
        return text ? text : '-';
      }
    }, {
      title: '负责人',
      dataIndex: 'owner',
      render: (text) => {
        return text ? <TextOverFlow content={text} maxWidth={80} /> : '-';
      }
    }, {
      title: '创建人',
      dataIndex: 'creator',
      render: (text) => {
        return text ? <TextOverFlow content={text} maxWidth={80} /> : '-';
      }
    }, {
      title: '起止时间',
      dataIndex: 'timeRange',
      width: '16vw',
      render: (text, record) => {
        return (<div>
          {(record && !!record.startTime && !!record.endTime) ?
            <span>{record.startTime}~{record.endTime}</span>
            : '-'
          }
        </div>);
      }
    }, {
      title: '',
      dataIndex: 'collect',
      width: 50,
      render: (text, record) => {
        return <CollectStar
          collect={record.collectStatus}
          style={{ fontSize: '20px' }}
          callback={() => this.collectOrNot(record)}
        />;
      }
    }, {
      title: '操作',
      dataIndex: 'operator',
      width: 60,
      className: 'column-caozuo',
      render: (text, record) => {
        return (
          <DropDown
            overlay={this.menuMore(record)}
          >
          </DropDown>
        );
      }
    }];
  }

  componentDidMount() {
    let projectListQuery = localStorage.getItem('projectListQuery') ?
      JSON.parse(localStorage.getItem('projectListQuery')) : {};
    // 清空product
    localStorage.setItem('projectListQuery', JSON.stringify(projectListQuery));
    this.setState({ filterObj: projectListQuery }, () => {
      this.getProjectList();
      this.getFilterList();
    });
  }

  menuMore = (record) => {
    const { dataDetail } = this.state;
    const recordDetail = dataDetail.find(it => it.projectId === record.id) || {};
    const status = record.status;

    return (<Menu className="u-pd10">
      <div className={styles.moreCard}>
        {
          recordDetail.roleGroup === ISSUE_ROLE_VALUE_MAP.MANAGE &&
          (status === PROJECT_STATUS_MAP.NEW || status === PROJECT_STATUS_MAP.DOING || status === PROJECT_STATUS_MAP.AIM_COMPLETE) &&
          <Link
            to={status === PROJECT_STATUS_MAP.NEW ? `/project/edit_project?id=${record.id}` : `/project/change_project?id=${record.id}`}
            target="_blank"
          >
            <a
              className="f-db u-mgb10 f-csp"
              onClick={(e) => { e.stopPropagation() }}>项目编辑</a>
          </Link>
        }
        <Link to={`/project/project_risk_list?id=${record.id}`} target="_blank">
          <a className="f-db" onClick={(e) => { e.stopPropagation() }}>风险管理</a>
        </Link>
        <Link to={`/project/project_week_report/list?id=${record.id}`} target="_blank">
          <a className="f-db u-mgt10" onClick={(e) => { e.stopPropagation() }}>周报管理</a>
        </Link>
      </div>
    </Menu>);
  }

  collectOrNot = (record) => {
    const { collectStatus } = record;
    let promise = null;
    if (collectStatus) {
      promise = cancelCollectProject({ projectId: record.id });
    } else {
      promise = addCollectProject({ projectId: record.id });
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.getProjectList();
      message.success(collectStatus ? '取消收藏成功！' : '收藏成功！');
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getProjectList = () => {
    const { order, orderField, pagination: { current },
      filterObj } = this.state;

    const productV3 = filterObj.productV3 || [];
    let productIdList = [];
    let subProductIdList = [];
    productV3.forEach(it => {
      const ids = it.split('-');
      ids[0] && productIdList.push(ids[0]);
      ids[1] && subProductIdList.push(ids[1]);
    });
    const status = filterObj.status ? filterObj.status : PROJECT_STATUS_EXCLUDE_FINISH;
    const params = {
      ...filterObj,
      status,
      order,
      orderField,
      pageSize: 10,
      pageNo: current,
      productIdList: productIdList,
      subProductIdList: subProductIdList,
    };
    this.setState({ loading: true });
    queryProjectList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询项目列表失败, ${res.msg}`);
      }
      this.setState({ loading: false });
      if (res.result) {
        const pagination = {
          ...this.state.pagination,
          total: res.result.total,
          current,
        };
        this.setState({
          data: res.result.list ? res.result.list : [],
          pagination
        });
        const projectIdList = res.result.list.map(it => it.id) || [];
        queryProjectListDetail({ projectIdList }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          this.setState({ dataDetail: res.result || [] });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`查询项目列表异常, ${err || err.message}`);
    });
  }

  getFilterList = () => {
    projectOwnerList().then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      this.setState({ ownerList: res.result });
    }).catch((err) => {
      return message.error(err || err.message);
    });

    projectCreatorList().then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      this.setState({ creatorList: res.result });
    }).catch((err) => {
      return message.error(err || err.message);
    });

    // 级联产品/子产品
    projectBelongSubProductList().then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      let arr = res.result || [];
      arr.forEach(it => {
        it.id = it.productId;
        it.children = it.subProductVOList || [];
        it.children.forEach(child => {
          child.name = child.subProductName;
        });
      });
      this.setState({ productList: arr });
    }).catch((err) => {
      return message.error(err || err.message);
    });

  }

  handleClose = (record) => {
    sessionStorage.setItem('currentPid', record.id);

    const that = this;
    warnModal({
      title: '关闭项目',
      content: '取消/终止项目，操作不可恢复，你确定要继续吗？',
      okCallback: () => {
        closeProject(record.id).then((res) => {
          if (res.code !== 200) return message.error(`关闭项目失败, ${res.msg}`);
          message.success('关闭项目成功！');
          that.getProjectList();
        }).catch((err) => {
          return message.error('关闭项目异常', err || err.message);
        });
      }
    });
  }

  updateFilter = (key, value) => {
    const { filterObj, pagination } = this.state;
    const newObj = {
      ...filterObj,
      [key]: value,
    };

    const newPagination = {
      ...pagination,
      current: 1,
    };

    localStorage.setItem('projectListQuery', JSON.stringify(newObj));

    this.setState({ filterObj: newObj, pagination: newPagination }, () => this.getProjectList());
  }

  handlePageChange = (pageNum) => {
    const { pagination } = this.state;
    const newObj = {
      ...pagination,
      current: pageNum
    };
    this.setState({ pagination: newObj }, () => this.getProjectList());
  }

  handleOk = () => {
    const { record } = this.state;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const closureCustomFields = []; // 自定义字段
      for (let i in values) {
        if (i.includes('custom')) {
          closureCustomFields.push({
            projectId: record.id,
            customFieldId: i.substring(7),
            value: values[i],
            templateId: record.templateId,
          });
        }
      }
      const params = {
        projectId: record.id,
        reviewer: values.reviewer,
        description: values.description,
        closureCustomFields,
      };
      finishProject(params).then((res) => {
        if (res.code !== 200) return message.error(`发起结项失败，${res.msg}`);
        message.success('发起结项成功！');
        this.getProjectList();
        this.setState({ visible: false });

      }).catch((err) => {
        return message.error(`发起结项异常, ${err || err.message}`);
      });
    });

  }

  changeOrderField = (value) => {
    this.setState({ orderField: value }, () => this.getProjectList());
  }

  changeOrder = (value) => {
    this.setState({ order: value }, () => this.getProjectList());
  }

  render() {
    const { visible, data, pagination: { total, current },
      loading, ownerList, creatorList, record, productList, orderFieldData, orderData, filterObj } = this.state;

    return ([
      <div className='bgCard' style={{ padding: '12px 16px' }}>
        <div className={`f-jcsb-aic`}>
          <span className={`f-aic`}>
            <MyIcon type='icon-xiangmuliebiao1' style={{ fontSize: '28px' }} />
            <span className='f-fs3' style={{ marginLeft: '6px' }}>项目列表</span>
          </span>
          <span>
            <Link to='/project/create_project'><Button type="primary">创建项目</Button></Link>
          </span>
        </div>
        <div className={`${styles.queryArea} f-jcsb`}>
          <span className='f-ib' style={{ width: 'calc(100% - 150px)' }}>
            <QueryArea
              updateFilter={this.updateFilter}
              ownerList={ownerList}
              creatorList={creatorList}
              productList={productList}
              filterObj={filterObj}
            />
          </span>

          <div className='f-fr u-mgt15'>
            <span className='grayColor'>排序：</span>
            <OrderTime
              changeOrderField={this.changeOrderField}
              changeOrder={this.changeOrder}
              orderFieldData={orderFieldData}
              orderData={orderData}
            />
          </div>
        </div>
        <div className={styles.tableList}>
          <Spin spinning={loading}>
            {data && data.length ?
              <Table
                columns={this.columns}
                dataSource={data}
                onRow={(record) => {
                  return {
                    className: 'f-csp',
                    onClick: () => {
                      window.open(`${window.location.origin}/v2/project/detail/?id=${record.id}`, '_blank');
                    },
                  };
                }}
                pagination={{
                  pageSize: 10,
                  current: current,
                  onChange: this.handlePageChange,
                  defaultCurrent: 1,
                  total: total
                }}
              /> :
              <span className='u-pd20'>
                <Empty />
              </span>
            }
          </Spin>
        </div>

        <Modal
          maskClosable={false}
          visible={visible}
          title="申请结项"
          onOk={() => this.handleOk()}
          onCancel={() => this.setState({ visible: false })}
        >
          <FinishProject form={this.props.form} data={record} />
        </Modal>
      </div>
    ]);
  }
}

const mapStateToProps = (state) => {
  return {
  };
};

export default connect(mapStateToProps)(Form.create()(Index));

