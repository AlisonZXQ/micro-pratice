import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Button, Modal, Pagination, Checkbox, message, Tag, Radio, Spin } from 'antd';
import { getAloneIssue, issueRelationAdd } from '@services/receipt';
import TextOverFlow from '@components/TextOverFlow';
import EpIcon from '@components/EpIcon';
import DefineDot from '@components/DefineDot';
import { filterCustom } from '@utils/helper';
import { connTypeMap, connTypeIdMap } from '@shared/ReceiptConfig';
import { nameMap, colorDotMap as colorMap } from '@shared/CommonConfig';
import QueryArea from './components/QueryArea';
import styles from './index.less';

const RadioGroup = Radio.Group;

const titleMap = {
  'advise': '建议',
  'bug': '缺陷',
  'requirement': '需求',
  'task': '任务',
  'objective': '目标',
  'ticket': '工单'
};

/**
 * @parentIssueType 哪个单据发起的关联操作
 * @issueType 当前关联操作所针对的对象
 * @example 在缺陷单据下关联需求，parentIssueType是bug,issuetype是requirement
 */

class index extends Component {
  state = {
    visible: false,
    current: 1,
    checkList: [],
    checkAlone: '',
    filterObj: {},
    issueObj: [],
    loading: false,
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  getSubProductList = () => {
    const { parentIssueType, lastProduct, nextObj, next } = this.props;
    const detail = next ? nextObj : this.props[`${parentIssueType}Detail`];
    const product = (detail && detail.product) || {};
    this.props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: product.id || lastProduct.id } });
  }

  getFullLink = () => {
    const { parentIssueType, parentIssueId } = this.props;
    const params = {
      type: connTypeMap[parentIssueType],
      id: this.props.location.query[connTypeIdMap[parentIssueType]] || parentIssueId,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  getAloneIssue = () => {
    this.setState({ loading: true });
    const { issueType, parentIssueType } = this.props;
    const { filterObj, current } = this.state;

    const params = {
      ...filterObj,
      issueType: connTypeMap[issueType],
      parentIssueType: connTypeMap[parentIssueType],
      offset: (current - 1) * 10,
      limit: 10,
    };
    getAloneIssue(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ issueObj: res.result || {} });
      this.setState({ loading: false });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { issueType, parentIssueType, isMulti, parentIssueId } = this.props;
    const { checkList, checkAlone } = this.state;

    let params = {
      issueIdList: isMulti ? checkList : [checkAlone],
      issueType: connTypeMap[issueType],
      parentIssueId: this.props.location.query[connTypeIdMap[parentIssueType]] || parentIssueId,
      parentIssueType: connTypeMap[parentIssueType],
    };

    // 反向绑定关系
    if ((issueType === "objective" && parentIssueType === 'requirement')
      || (issueType === "objective" && parentIssueType === 'task')
      || (issueType === "requirement" && parentIssueType === 'task')
    ) {
      if (!checkAlone) {
        return message.error('关联单据必选！');
      }
      params = {
        issueIdList: [this.props.location.query[connTypeIdMap[parentIssueType]] || parentIssueId],
        issueType: connTypeMap[parentIssueType],
        parentIssueId: checkAlone,
        parentIssueType: connTypeMap[issueType],
      };
    } else if (!checkList.length) {
      return message.error('关联单据必选！');
    }

    issueRelationAdd(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('关联成功！');
      this.setState({ visible: false, checkAlone: '', checkList: [] });
      this.getFullLink();
      // 扩展性，建议受理
      if (this.props.callback) {
        this.props.callback();
      }
      if (this.props.refreshFun && typeof this.props.refreshFun === 'function') {
        this.props.refreshFun();
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  belongUser = (id) => {
    const { currentUser } = this.props;
    const userId = currentUser && currentUser.user && currentUser.user.id;
    if (id === userId) {
      return <Tag>我的</Tag>;
    } else {
      return null;
    }
  }

  updateFilter = (key, value, type) => {
    this.setState({ current: 1 });
    const { filterObj } = this.state;
    const newFilterObj = {
      ...filterObj,
    };
    if (key.includes('customfield')) {
      newFilterObj['customfield'] = filterCustom(key, value, type, newFilterObj);
    } else {
      newFilterObj[key] = value;
    }

    this.setState({ filterObj: newFilterObj }, () => this.getAloneIssue());
  }

  handleOpenRelateIssue = () => {
    const { parentIssueType, nextObj, next } = this.props;
    let detail = {};
    if (next) { //从切换状态中的下一步中进来
      detail = nextObj;
    } else {
      detail = this.props[`${parentIssueType}Detail`] || {};
    }

    const product = detail.product || {};
    const subproduct = detail.subproduct || {};

    this.setState({ visible: true });
    const newObj = {
      ...this.state.filterObj,
      productid: product.id,
      subProductId: subproduct.id,
    };
    this.setState({
      filterObj: newObj,
    }, () => {
      this.getAloneIssue();
      this.getSubProductList();
    });
  }

  getDetailButtons = () => {
    const { issueType, next } = this.props;
    switch (issueType) {
      case 'advise':
      case 'bug':
      case 'requirement':
      case 'task':
      case 'objective':
      case 'ticket':
        return ([
          next &&
          <Button onClick={() => this.handleOpenRelateIssue()}>
            下一步
          </Button>,

          !next &&
          <Button
            onClick={() => this.handleOpenRelateIssue()}
            type="dashed"
          >
            关联{titleMap[issueType]}
          </Button>
        ]);
      default: return null;
    }
  }

  handleChangePage = (num) => {
    this.setState({ current: num }, () => this.getAloneIssue());
  }

  handleChange = (checked, value) => {
    const { checkList } = this.state;
    let newCheckList = [...checkList];
    if (checked && !newCheckList.some(it => it === value)) {
      newCheckList.push(value);
    } else {
      newCheckList = newCheckList.filter(it => it !== value);
    }
    this.setState({ checkList: newCheckList });
  }

  getContent = (it) => {
    const { issueType, isMulti } = this.props;
    const { checkList } = this.state;
    const obj = (it && it[issueType]) || {};
    const key = obj.id;
    const name = obj.name;
    const state = obj.state;
    const Com = isMulti ? Checkbox : Radio;

    return <div>
      <Com
        key={key}
        value={key}
        checked={isMulti ? checkList.some(i => i === key) : this.state.checkAlone === key}
        onChange={(e) =>{
          isMulti ? this.handleChange(e.target.checked, key) :
            this.setState({ checkAlone: e.target.value });
        }}
      >
        <span className='f-ib' style={{ height: '30px', lineHeight: '30px' }}>
          <span style={{ display: 'inline-table' }}>
            {this.belongUser(it && it.submitUser && it.submitUser.id)}
            <span className='f-vam' style={{ marginRight: '4px' }}>
              <EpIcon type={issueType} className={`f-fs3`} />
            </span>
            <TextOverFlow content={name} maxWidth={'380px'} />
          </span>
          <span className='f-ib' style={{ position: 'absolute', right: '20px' }}>
            <span style={{ width: '80px', display: 'inline-block' }}>
              <DefineDot
                text={state}
                statusMap={nameMap[issueType]}
                statusColor={colorMap[issueType]}
              />
            </span>
            <span className="u-mgl10" style={{ position: 'relative', top: '2px', width: '120px', display: 'inline-block' }}>
              <TextOverFlow content={it && it.responseUser && it.responseUser.realname} maxWidth={'150px'} />
            </span>
          </span>
        </span>
      </Com></div>;
  }

  render() {
    const { type, issueType, isMulti, parentIssueType, next, nextObj } = this.props;
    const { visible, issueObj, checkAlone } = this.state;
    const detail = next ? nextObj : this.props[`${parentIssueType}Detail`];
    const product = (detail && detail.product) || {};
    const issueList = issueObj.list || [];

    return (<span>
      <Modal
        title={titleMap[issueType]}
        visible={visible}
        width={1290}
        onCancel={() => this.setState({ visible: false, filterObj: {} })}
        onOk={() => this.handleOk()}
        destroyOnClose
        maskClosable={false}
      >
        <QueryArea
          updateFilter={this.updateFilter}
          type={issueType}
          productid={product.id}
          parentParams={this.state.filterObj}
          detail={detail}
        />
        <Spin spinning={this.state.loading}>
          <div style={{ height: '310px', overflow: 'auto' }} className={`${styles.container} u-mg10`}>
            {
              issueList.map(it => this.getContent(it))
            }
          </div>
        </Spin>

        <Pagination
          showQuickJumper
          defaultCurrent={1}
          current={this.state.current}
          total={issueObj.count}
          showTotal={total => `总共有 ${total} 条数据`}
          onChange={this.handleChangePage}
        />
      </Modal>

      {type !== 'list' ? this.getDetailButtons() :
        <a onClick={() => this.setState({ visible: true })}>关联建议</a>}
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    lastProduct: state.product.lastProduct,
    subProductAll: state.product.enableSubProductList,

    // 根据parentIssueType判断从哪个detail下取product
    adviseDetail: state.advise.adviseDetail,
    requirementDetail: state.requirement.requirementDetail,
    objectiveDetail: state.objective.objectiveDetail,
    bugDetail: state.bug.bugDetail,
    taskDetail: state.task.taskDetail,
    subTaskDetail: state.task.taskDetail,
    ticketDetail: state.ticket.ticketDetail,
  };
};

export default withRouter(connect(mapStateToProps)(index));
