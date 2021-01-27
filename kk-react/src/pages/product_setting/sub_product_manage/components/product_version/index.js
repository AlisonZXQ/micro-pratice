import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Button, Divider, Modal, message, Spin, Input, Popover } from 'antd';
import { getVersionList, getVersionListTotal } from '@services/requirement';
import { addVersion, deleteVersion, getVersionSelect, updateVersion } from '@services/version';
import BackToPreview from '@components/BackToPreview';
import BusinessHOC from '@components/BusinessHOC';
import FilterSelect from '@components/FilterSelect';
import DefineDot from '@components/DefineDot';
import { versionNameMap, versionColorDotMap } from '@shared/CommonConfig';
import { JIRA_SYNC_USE, versionArr } from '@shared/ProductSettingConfig';
import { deleteModal } from '@shared/CommonFun';
import VersionForm from './components/VersionForm';
import JiraVersion from './components/JiraVersion';
import styles from './index.less';

const JIRA_SYNC_OPEN = `${JIRA_SYNC_USE.OPEN}`;

const isEmpty = (text) => {
  return text ? text : '-';
};

const { Search } = Input;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: '', // create创建 edit编辑
      versionObj: {},
      filterObj: {},
      current: 1,
      total: 0,
      versionList: [],
      loading: false,
    };

    this.columns = [{
      title: 'jiraid',
      dataIndex: 'jiraid',
      render: (text, record) => {
        return isEmpty(record.version && record.version.jiraid);
      }
    }, {
      title: '所属子产品',
      dataIndex: 'subProduct',
      render: (text, record) => {
        const { subProductName } = this.props.location.query;
        return <span>
          {isEmpty(subProductName)}
        </span>;
      }
    }, {
      title: '版本名称',
      dataIndex: 'name',
      render: (text, record) => {
        return <span className='f-ib f-toe' style={{ maxWidth: '20vh' }}>
          <Popover content={isEmpty(record.version && record.version.name)}>
            {isEmpty(record.version && record.version.name)}
          </Popover>
        </span>;
      }
    }, {
      title: '状态',
      dataIndex: 'state',
      render: (text, record) => {
        return <DefineDot
          text={record.version.state}
          statusMap={versionNameMap}
          statusColor={versionColorDotMap}
        />;
      }
    }, {
      title: '计划发布日期',
      dataIndex: 'endtime',
      render: (text, record) => {
        return record.version && record.version.endtime ? moment(record.version.endtime).format('YYYY-MM-DD') : '-';
      }
    }, {
      title: '实际发布日期',
      dataIndex: 'releasetime',
      render: (text, record) => {
        return record.version && record.version.releasetime ? moment(record.version.releasetime).format('YYYY-MM-DD') : '-';
      }
    }, {
      title: '描述',
      dataIndex: 'description',
      render: (text, record) => {
        return <span className='f-ib f-toe' style={{ maxWidth: '20vh' }}>
          <Popover content={isEmpty(record.version && record.version.description)}>
            {isEmpty(record.version && record.version.description)}
          </Popover>
        </span>;
      }
    }, {
      title: '操作',
      dataIndex: 'opt',
      render: (text, record) => {
        return <span>
          <a onClick={() => this.handleEdit(record.version.id)}>编辑</a>
          <Divider type="vertical" />
          {record.version && record.version.state !== 3 ?
            <a
              className="delColor"
              onClick={() => this.handleDelete(record)}>删除</a> :
            <Popover content='已发布版本不可删除'>
              <span className={styles.disabledColor}>删除</span>
            </Popover>
          }

        </span>;
      }
    }];
  }

  componentDidMount() {
    this.getVersionList();
  }

  handleEdit = (id) => {
    this.setState({ visible: true, type: 'edit' });
    getVersionSelect({ id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ versionObj: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = (record) => {
    const that = this;
    const params = {
      id: record.version && record.version.id,
    };

    deleteModal({
      title: `您确认要删除版本【${record.version.name}】吗?`,
      content: <span className="delColor">
        版本删除后不可恢复，版本中所有需求退回需求池
      </span>,
      okCallback: () => {
        deleteVersion(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('版本删除成功！');
          that.getVersionList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getVersionList = () => {
    this.setState({ loading: true });
    const { subProductId, productid } = this.props.location.query;
    const { filterObj, current } = this.state;
    const params = {
      productid: productid,
      subProductId,
      ...filterObj,
      offset: (current - 1) * 10,
      limit: 10,
    };
    getVersionList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({
        versionList: res.result,
        loading: false,
      });
    }).catch(err => {
      return message.error(err || err.message);
    });
    getVersionListTotal({ subProductId, ...filterObj }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ total: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {

    const { type, versionObj } = this.state;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (type === 'create') {
        const params = {
          ...values,
        };
        params['endtime'] = moment(params['endtime']).valueOf();
        this.addVersionEP(params);
      } else {
        const params = {
          id: versionObj.version.id,
          ...values,
        };
        params['endtime'] = moment(params['endtime']).valueOf();
        this.updateVersion(params);
      }
    });
  }

  updateVersion = (params) => {
    updateVersion(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新版本成功！');
      this.setState({ visible: false });
      this.getVersionList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  addVersionEP = (params) => {
    addVersion(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('创建版本成功！');
      this.setState({ visible: false });
      this.getVersionList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    const newObj = {
      ...filterObj,
      [value]: key,
    };
    this.setState({ filterObj: newObj, current: 1 }, () => this.getVersionList());
  }

  handlePageChange = (value) => {
    this.setState({ current: value }, () => this.getVersionList());
  }

  render() {
    const { isBusiness } = this.props;
    const { productid, jiraSync } = this.props.location.query;
    const { visible, type, versionObj, versionList, loading, current } = this.state;

    return (<div style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        <BackToPreview title="返回" link={`/product_setting/subProduct?productid=${productid}`} />
        <div className="bbTitle">
          <span className="name">版本列表</span>
        </div>

        <Card>
          <span className='f-jcsb-aic' style={{ position: 'relative', top: '-10px' }}>
            <span>
              <span className='queryHover'>
                <span className="f-ib f-vam grayColor">状态：</span>
                <FilterSelect
                  onChange={(value) => this.updateFilter(value, 'state')}
                  dataSource={versionArr && versionArr.map((item) => ({
                    label: item.name, value: item.id,
                  }))}
                />
              </span>

              <Search
                allowClear
                onSearch={value => this.updateFilter(value, 'name')}
                style={{ width: '200px' }}
                placeholder="搜索版本名称"
                className="u-mgr10 u-mgl10"
              />
            </span>

            <span>
              {jiraSync === JIRA_SYNC_OPEN && !isBusiness &&
                <JiraVersion versionList={versionList} getVersionList={this.getVersionList} />
              }
              <Button type="primary" onClick={() => this.setState({ visible: true, type: 'create' })}>创建版本</Button>
            </span>

          </span>
          <Table
            rowKey={record => record.version.id}
            columns={(jiraSync !== JIRA_SYNC_OPEN || isBusiness) ? this.columns.filter(it => it.dataIndex !== 'jiraid') : this.columns}
            dataSource={versionList}
            pagination={{
              pageSize: 10,
              current: current,
              onChange: this.handlePageChange,
              defaultCurrent: 1,
              total: this.state.total,
            }}
          />
        </Card>

        <Modal
          title={type === 'create' ? '创建版本' : '编辑版本'}
          visible={visible}
          width={800}
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.handleOk()}
          destroyOnClose
          maskClosable={false}
        >
          <VersionForm
            {...this.props}
            versionObj={versionObj}
            type={type} />
        </Modal>
      </Spin>
    </div>);
  }
}

export default connect()(BusinessHOC()(Form.create()(index)));
