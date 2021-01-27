import React, { Component } from 'react';
import { Popconfirm, message, Empty } from 'antd';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import CreateLog from '@pages/receipt/components/create_log';
import { deleteWorkLoad } from '@services/product';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import styles from './index.less';

class index extends Component {
  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount(){
    this.getLogList();
  }

  getLogList = () => {
    const params = {
      connType: this.props.connType,
      connId: this.props.issueObj.id,
    };
    this.props.dispatch({ type: 'receipt/getLogList', payload: params });
  }

  handleDelete = (id) => {
    deleteWorkLoad({ id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('删除日志成功！');
      this.getLogList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getLastTwoWords = (str) => {
    return str.substring(str.length - 2);
  }

  checkPermissionDelete = (userId) => {
    const { issueRole, currentUser } = this.props;
    const currentUserId = currentUser && currentUser.user && currentUser.user.id;
    if(issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE || issueRole === ISSUE_ROLE_VALUE_MAP.EDIT) { //管理员
      return true;
    }else if(issueRole === ISSUE_ROLE_VALUE_MAP.READ && currentUserId === userId) { //查看权限(自己)
      return true;
    }else {
      return false;
    }
  }

  render() {
    const { logList, drawer } = this.props;

    return (<div className={styles.workLog}>
      <CreateLog
        onRef={(ref) => this.logRef = ref}
        currentUser={this.props.currentUser}
        productid={this.props.lastProduct.id}
        connType={this.props.connType}
        connId={this.props.issueObj.id}
        edit
      />
      {!!logList.length && logList.map((it) => (
        <div className={styles.item}>
          <span className={styles.name}>
            {this.getLastTwoWords(it.user.name)}
          </span>

          <span className={styles.content}>
            <div className={styles.logTitle}>
              <span className='u-mgr10'>
                {it.user.name}
              </span>

              <span className='u-mgr10'>
                {it.createTime}
              </span>

              <span className='u-mgr10'>
                添加工时
                {it.workload}h
              </span>
              {drawer && it.updateTime && <br />}


              {it.updateTime &&
                <span className={styles.tag} style={ drawer ? {marginTop: '5px'} : {} }>
                  {it.updateUser.name}于
                  {it.updateTime}修改
                </span>
              }

              <span className={styles.operation}>
                <MyIcon
                  onClick={() => this.logRef.openModal(it)}
                  type="icon-bianji"
                  className={`${styles.icon} f-fs2 f-csp`} />
              </span>
              {this.checkPermissionDelete(it.user.id) && <span className={styles.operation}>
                <Popconfirm
                  title="确定删除吗?"
                  onConfirm={() => this.handleDelete(it.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <MyIcon type="icon-shanchupinglun" className={`${styles.icon} f-fs2 f-csp`} />
                </Popconfirm>
              </span>}
            </div>

            <div dangerouslySetInnerHTML={{ __html: it.description }} className={styles.logDetail} />
          </span>
        </div>
      ))}
      {
        !logList.length && <Empty />
      }

    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    logList: state.receipt.logList,
    currentUser: state.user.currentUser,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(index);
