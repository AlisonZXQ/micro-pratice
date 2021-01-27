import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import Attachment from '@pages/receipt/components/attachment';

class ProjectAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    const { id } = this.props.location.query;
    this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id } });
  }

  render() {
    const { id } = this.props.location.query;
    const { currentMemberInfo } = this.props;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;

    return (<div>
      <div className={`f-csp u-mgt10 u-mgl10`} onClick={() => history.push(`/project/detail?id=${id}`)}>
        <span>
          <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
          返回项目
        </span>
      </div>

      <Card className={`bgCard`}>
        <div className='bbTitle f-jcsb-aic'>
          <span className='name'>附件管理</span>
        </div>
        <div
          className='bgWhiteModel u-mgt8'
          style={{ paddingBottom: '0px' }}
        >
          <Attachment type="project" connid={id} roleGroup={roleGroup} fromDetail />
        </div>
      </Card></div>);
  }

}
const mapStateToProps = (state) => {
  return {
    currentMemberInfo: state.user.currentMemberInfo,
  };
};

export default connect(mapStateToProps)(Form.create()(ProjectAttachment));
