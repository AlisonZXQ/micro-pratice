import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { CaretDownOutlined } from '@ant-design/icons';
import { message, Select, Dropdown, Menu, Popover } from 'antd';
import MyIcon from '@components/MyIcon';
import { equalsObj } from '@utils/helper';
import { addSubscribeByType, addSubscribeSelfByType, deleteSubscribeByType, getSubscribeNum } from '@services/requirement';
import { getUserGroupSearchEnt } from '@services/report';
import { connTypeMapIncludeProject, connTypeIdMap, ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { SUBSCRIBE_USER_TYPE } from '@shared/ReceiptConfig';
import styles from './index.less';

const Option = Select.Option;

class index extends Component {
  state = {
    dataSource: [],
    addPanel: false,
    addType: '',
    visible: false,
    userGroupList: [],
    userCount: 0,
  }

  componentDidMount() {
    const { type, connid } = this.props;
    const id = this.props.location.query[connTypeIdMap[type]] || connid;
    if (type && id) {
      this.getSubscribeByType(id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.subscribeUser, nextProps.subscribeUser)) {
      this.getDefaultData(nextProps.subscribeUser);
    }
    if (this.props.connid !== nextProps.connid) {
      this.getSubscribeByType(nextProps.connid);
    }
  }

  getSubscribeByType = (id) => {
    const { type, connid } = this.props;

    const params = {
      conntype: connTypeMapIncludeProject[type],
      connid: this.props.location.query[connTypeIdMap[type]] || id || connid,
    };
    this.subscribeNum(params);
    this.props.dispatch({ type: 'requirement/getSubscribeByType', payload: params });
  }

  subscribeNum = (params) => {
    getSubscribeNum(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      const userCount = (res.result && res.result.uniqueUserCount) || 0;
      this.setState({ userCount });
    }).catch((e) => {
      return message.error(`添加关注人数量异常，${e || e.message}`);
    });
  }

  getDefaultData = (data) => {
    this.setState({ dataSource: data.map(it => it.email) });
  }

  handleSearch = (value) => {
    const { addType } = this.state;
    if (value.trim().length) {
      if (addType === 'user') {
        const params = {
          value,
          offset: 0,
          limit: 20,
        };
        this.props.dispatch({ type: 'user/queryUser', payload: params });
      } else {
        const productid = this.props.location.query.productid || this.props.productid;
        const params = {
          productid,
          offset: 0,
          limit: 20,
          name: value,
        };
        getUserGroupSearchEnt(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          this.setState({ userGroupList: res.result });
        }).catch((e) => {
          return message.error(`添加关注人异常，${e || e.message}`);
        });
      }
    }
  }

  addSubscribeByType = (params) => {
    const { addType } = this.state;
    addSubscribeByType(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (addType === 'user') {
        message.success('添加关注人成功！');
      } else {
        message.success('添加用户组成功！');
      }
      this.setState({ addPanel: false });
      this.getSubscribeByType();
    }).catch((e) => {
      return message.error(`添加关注异常，${e || e.message}`);
    });
  }

  addSubscribeSelfByType = (params) => {
    addSubscribeSelfByType(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('添加关注成功！');
      this.setState({ addPanel: false });
      this.getSubscribeByType();
    }).catch((e) => {
      return message.error(`添加关注异常，${e || e.message}`);
    });
  }

  handleDelete = (item, self) => {
    const { type } = item.subscribe || 0;
    const { subscribeUser } = this.props;
    let obj = {};
    if (type === SUBSCRIBE_USER_TYPE.USER) {
      obj = subscribeUser.find(it => it.email === item.email);
    } else if (type === SUBSCRIBE_USER_TYPE.USER_GROUP) {
      obj = subscribeUser.find(it => it.name === item.name);
    } else if (self === 'myself') {
      obj = subscribeUser.find(it => it.email === item);
    }

    deleteSubscribeByType({ id: obj.subscribe.id }).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (type === SUBSCRIBE_USER_TYPE.USER || self === 'myself') {
        message.success('删除关注人成功！');
      } else if (type === SUBSCRIBE_USER_TYPE.USER_GROUP) {
        message.success('删除用户组成功！');
      }

      this.getSubscribeByType();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleSelect = (value) => {
    const { type, connid } = this.props;
    const { addType } = this.state;
    if (addType === 'user') {
      const params = {
        type: SUBSCRIBE_USER_TYPE.USER,
        email: value,
        conntype: connTypeMapIncludeProject[type],
        connid: this.props.location.query[connTypeIdMap[type]] || connid,
      };
      this.addSubscribeByType(params);
    } else if (addType === 'group') {
      const params = {
        type: SUBSCRIBE_USER_TYPE.USER_GROUP,
        userGroupId: value,
        conntype: connTypeMapIncludeProject[type],
        connid: this.props.location.query[connTypeIdMap[type]] || connid,
      };
      this.addSubscribeByType(params);
    }
  }

  handleSelectSelf = (value) => {
    const { type, connid } = this.props;
    const params = {
      email: value,
      conntype: connTypeMapIncludeProject[type],
      connid: this.props.location.query[connTypeIdMap[type]] || connid,
    };
    this.addSubscribeSelfByType(params);
  }

  getContent = () => {
    const { addPanel, addType } = this.state;
    if (addPanel && addType === 'user') {
      return this.getAddContent();
    } else if (addPanel && addType === 'group') {
      return this.getAddGroupContent();
    } else {
      return this.getDetailContent();
    }
  }

  getDetailContent = () => {
    const { currentUser, subscribeUser, issueRole, type } = this.props;
    const { dataSource } = this.state;
    const email = currentUser && currentUser.user && currentUser.user.email;

    const lastWord = (str) => {
      return str && str.length > 1 ? str.slice(str.length - 1) : str;
    };

    return (<div className={styles.detailC}>
      {
        dataSource.includes(email) ?
          <div onClick={() => this.handleDelete(email, 'myself')} className={styles.opt}>取消关注</div>
          :
          <div onClick={() => this.handleSelectSelf(email)} className={styles.opt}>
            {type === 'project' ? '关注该项目' : '关注该单据'}
          </div>
      }
      {
        issueRole === ISSUE_ROLE_VALUE_MAP.EDIT || issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE ?
          <div onClick={() => this.setState({ addPanel: true, addType: 'user' })} className={styles.opt}>添加关注人</div>
          :
          ''
      }
      {
        issueRole === ISSUE_ROLE_VALUE_MAP.EDIT || issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE ?
          <div onClick={() => this.setState({ addPanel: true, addType: 'group' })} className={styles.opt}>添加用户组</div>
          :
          ''
      }
      <div className={styles.divider}></div>
      <div className={styles.des}>
        {this.state.userCount}
        位成员正在关注
      </div>
      {subscribeUser && subscribeUser.map(it => <div className="u-mgt5">
        {it.subscribe.type === SUBSCRIBE_USER_TYPE.USER ?
          <span className={styles.lastWord}>{lastWord(it.realname)}</span> :
          <MyIcon className={styles.group} type='icon-yonghuzu' />
        }
        {it.subscribe.type === SUBSCRIBE_USER_TYPE.USER ?
          <span className={styles.overText}>{it.realname} {it.email}</span> :
          <Popover content={`${it.name}-${it.groupProduct && it.groupProduct.name}`}>
            <span className={styles.overGroupText}>
              {it.name}
              {it.groupProduct && it.groupProduct.name ? '-' : ''}
              {it.groupProduct && it.groupProduct.name}
            </span>
          </Popover>
        }

        {
          issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE ?
            <span onClick={() => this.handleDelete(it)} className="f-csp f-fr">
              <MyIcon type="icon-shanchuchengyuan" />
            </span>
            : ""
        }
      </div>)}
    </div>);
  }

  getAddContent = () => {
    const { queryUser } = this.props;

    return (<div className="u-pd10">
      <div className="f-jcsb-aic u-mgb10">
        <span className="f-csp" onClick={() => this.setState({ addPanel: false })}><MyIcon type="icon-fanhuitubiao" /></span>
        <span>添加关注</span>
        <span className="f-csp" onClick={() => this.setState({ visible: false }, () => this.setState({ addPanel: false }))}><MyIcon type="icon-guanbi" /></span>
      </div>
      <Select
        showSearch
        style={{ width: '100%' }}
        onSearch={(value) => this.handleSearch(value)}
        optionFilterProp="children"
        onChange={this.handleChange}
        onSelect={(value) => this.handleSelect(value)}
      >
        {
          queryUser && queryUser.map(it => (<Option
            key={`${it.email}`}
            value={`${it.email}`}
            data={it}
          >
            {it.realname} {it.email}
          </Option>))
        }
      </Select>
    </div>);
  }

  getAddGroupContent = () => {
    const { userGroupList } = this.state;

    return (<div className="u-pd10">
      <div className="f-jcsb-aic u-mgb10">
        <span className="f-csp" onClick={() => this.setState({ addPanel: false })}><MyIcon type="icon-fanhuitubiao" /></span>
        <span>添加关注</span>
        <span className="f-csp" onClick={() => this.setState({ visible: false }, () => this.setState({ addPanel: false }))}><MyIcon type="icon-guanbi" /></span>
      </div>
      <Select
        showSearch
        style={{ width: '100%' }}
        onSearch={(value) => this.handleSearch(value)}
        optionFilterProp="children"
        onChange={this.handleChange}
        onSelect={(value) => this.handleSelect(value)}
      >
        {
          userGroupList && userGroupList.map(it => (<Option
            key={`${it.rbacUserGroup.id}`}
            value={`${it.rbacUserGroup.id}`}
            data={it.rbacUserGroup}
          >
            {it.rbacUserGroup.name}-{it.product.name}
          </Option>))
        }
      </Select>
    </div>);
  }

  menuMore = () => {
    return (
      <Menu style={{ width: '220px' }}>
        {this.getContent()}
      </Menu>);
  }

  onVisibleChange = (visible) => this.setState({ visible });

  render() {
    const { visible } = this.state;

    return (
      <span className={`btn98`}>
        <Dropdown
          overlay={this.menuMore()}
          trigger={['click']}
          visible={visible}
          onVisibleChange={this.onVisibleChange}
        >
          <span>
            <MyIcon type="icon-guanzhuren" className="f-fs5 u-mgr5" style={{ position: 'relative', top: '3px' }} />
            <span className={styles.userCount}>
              {this.state.userCount}
            </span>
            人关注中
            <CaretDownOutlined className="f-fs1 u-mgl5" />
          </span>
        </Dropdown>
      </span>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    queryUser: state.user.queryUser,
    subscribeUser: state.requirement.subscribeUser,
    currentUser: state.user.currentUser,
  };
};

export default withRouter(connect(mapStateToProps)(index));
