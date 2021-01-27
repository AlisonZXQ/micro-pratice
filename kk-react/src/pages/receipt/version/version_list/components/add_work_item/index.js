import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Button, Checkbox, Pagination, message, Empty, Spin, Popover } from 'antd';
import { connect } from 'dva';
import { getVersionSelectData, batchAddVersion } from '@services/version';
import { versionIssueTypeArr, versionIssueTypeMap, issueMapArr } from '@shared/ReceiptConfig';
import EpIcon from '@components/EpIcon';
import DefineDot from '@components/DefineDot';
import QueryArea from './components/QueryArea.js';
import styles from './index.less';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      params: {
        current: 1,
      },
      total: 0,
      list: [],
      checkList: [],
      loading: false,
    };
  }

  componentDidMount() {

  }

  handleOk = () => {
    this.setState({ visible: false, checkList: [], params: { current: 1 } });
    const { versionId } = this.props;
    const { checkList } = this.state;
    const params = {
      versionId,
      data: checkList
    };
    batchAddVersion(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.props.getVersionSelectList(this.props.versionId);
      return message.success('添加成功');
    }).catch(err => {
      return message.error(err.message);
    });
  }

  updateFilter = (key, value) => {
    const { params } = this.state;
    let newParams = {
      ...params,
      [key]: value,
      current: 1,
    };
    if (key === 'subProductIdList' && !value.length) {
      newParams.subProductIdList = this.getSubProductIdListAll();
    }else if (key === 'typeList' && !value.length) {
      newParams.typeList = this.getTypeListAll();
    }else if(key === 'name' && value === '') {
      delete newParams.id;
    }
    this.setState({ params: newParams }, () => this.getListData());
  }

  handleChangeChecked = (it) => {
    let { checkList } = this.state;
    if (checkList.findIndex(item => item.connId === it.connId) > -1) {
      checkList.splice(checkList.findIndex(item => item.connId === it.connId), 1);
    } else {
      checkList.push({
        connId: it.connId,
        connType: it.connType
      });
    }
    this.setState({ checkList });
  }

  onPageChange = (page, pageSize) => {
    const params = {
      ...this.state.params,
      current: page,
    };
    this.setState({ params }, () => this.getListData());
  }

  getListData = () => {
    this.setState({ loading: true });
    const { params } = this.state;
    const newParams = {
      ...params,
      offset: (params.current - 1) * 10,
      limit: 10
    };
    getVersionSelectData(newParams).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ total: res.result.totalCount });
      this.setState({ list: res.result.data });
      this.setState({ loading: false });
    }).catch(err => {
      return message.error(err.message);
    });
  }

  openModal = () => {
    this.setState({ visible: true });
    const subProductIdList = this.getSubProductIdListAll();
    const typeList = this.getTypeListAll();
    const { productid } = this.props;
    const params = {
      ...this.state.params,
      productId: productid,
      subProductIdList,
      typeList,
    };
    this.setState({ params }, () => this.getListData());
  }

  getSubProductIdListAll = () => {
    let arr = [];
    const { subProductAll } = this.props;
    subProductAll && subProductAll.map(it => {
      arr.push(it.id);
    });
    return arr;
  }

  getTypeListAll = () => {
    let arr = [];
    versionIssueTypeArr.map(it => {
      arr.push(it.value);
    });
    return arr;
  }

  issueNameMap = () => {
    let obj = {};
    issueMapArr.map(it => {
      obj[it.value] = it.label;
    });
    return obj;
  }

  issueColorDotMap = () => {
    let obj = {};
    issueMapArr.map(it => {
      obj[it.value] = it.colordot;
    });
    return obj;
  }

  handleCheckedAll = (checked) => {
    const { list, checkList } = this.state;
    let arr = [];
    if(checked) { //全选
      list.map(it => {
        if(checkList.find(x => x.connId === it.connId && x.connType === it.connType)) {
          return;
        }else {
          arr.push({
            connId: it.connId,
            connType: it.connType
          });
        }
      });
      const newArr = checkList.concat(arr);
      this.setState({ checkList: newArr });
    }else { //全不选
      let newArr = [];
      checkList.map(it => {
        const index = list.findIndex(x => x.connId === it.connId && x.connType === it.connType);
        if(index === -1) {
          newArr.push({
            connId: it.connId,
            connType: it.connType
          });
        }
      });
      this.setState({ checkList: newArr });
    }
  }

  isCheckAll = () => {
    const { list, checkList } = this.state;
    let checkAll = true;
    list.map(it => {
      const index = checkList.findIndex(x => x.connType === it.connType && x.connId === it.connId);
      if(index === -1) {
        checkAll = false;
      }
    });
    return checkAll;
  }

  render() {
    const { visible, checkList, total, list, loading } = this.state;
    const { subProductAll, allProductUser } = this.props;
    return <span>
      <Modal
        title='添加工作项'
        onCancel={() => this.setState({ visible: false, checkList: [], params: { current: 1 } })}
        width={1000}
        footer={<span>
          <Button onClick={() => this.setState({ visible: false, checkList: [], params: { current: 1 } })}>取消</Button>
          <Button type='primary' onClick={() => { this.handleOk() }}>确认({checkList && checkList.length})</Button>
        </span>}
        visible={visible}>
        <Spin spinning={loading}>
          <QueryArea
            subProductAll={subProductAll}
            allProductUser={allProductUser}
            updateFilter={this.updateFilter}
          />
          <div className={styles.tableHead}>
            <span className={styles.item} style={{ width: '60%' }}>
              <Checkbox
                onChange={(it) => this.handleCheckedAll(it.target.checked)}
                checked={this.isCheckAll()}
              ></Checkbox>
              <span style={{ marginLeft: '8px' }}>
                标题
              </span>
            </span>
            <span className={styles.item} style={{ width: '20%' }}>状态</span>
            <span className={styles.item} style={{ width: '20%' }}>负责人</span>
          </div>

          <div className={styles.tableContent}>
            {list && list.map(it => (
              <div className={styles.row}>
                <span className={styles.item} style={{ width: '60%' }}>
                  <Checkbox
                    key={it.connId}
                    checked={checkList.find(item => item.connId === it.connId)}
                    value={it.connId}
                    onChange={() => this.handleChangeChecked(it)}>
                    <EpIcon type={versionIssueTypeMap[it.connType]} />
                    <span className={`u-mgl5 f-toe ${styles.itemName}`}>
                      <Popover content={it.name}>
                        {it.name}
                      </Popover>
                    </span>
                  </Checkbox>
                </span>
                <span className={styles.item} style={{ width: '20%' }}>
                  <DefineDot
                    text={it.state}
                    statusMap={this.issueNameMap()}
                    statusColor={this.issueColorDotMap()}
                  />
                </span>
                <span className={styles.item} style={{ width: '20%' }}>
                  {it.responseRealName}
                </span>
              </div>
            ))}
            {!list.length && <div className='u-mgt20 u-mgb20'>
              <Empty />
            </div>}
          </div>

          <div className='u-mgt10'>
            <Pagination
              onChange={this.onPageChange}
              defaultCurrent={1}
              total={total}
              current={this.state.params.current}
            />
          </div>
        </Spin>

      </Modal>
      <a onClick={() => this.openModal()}>添加工作项</a>
    </span>;
  }
}

const mapStateToProps = (state) => {
  return {
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
