import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Card, Button, Tabs } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import { PROEJCT_PERMISSION } from '@shared/ProjectConfig';
import User from './user/index';
import UserGroup from './UserGroup/index';

const { TabPane } = Tabs;

class MangeMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: '1',
      sameRoleGroup: 0, //解决用户组子组件获取不到roleGroup的问题
    };
  }

  componentDidMount(){
    const { id } = this.props.location.query;
    this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id } });
  }

  render() {
    const { id } = this.props.location.query;
    const { activeKey, sameRoleGroup } = this.state;

    const { currentMemberInfo } = this.props;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;
    return (
      <div>
        <div className={`f-csp u-mgt10 u-mgl10`} onClick={() => history.push(`/project/detail?id=${id}`)}>
          <span>
            <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
            返回项目
          </span>
        </div>

        <Card className={`bgCard`}>
          <div className='bbTitle f-jcsb-aic'>
            <span className='name'>成员管理</span>
            {roleGroup === PROEJCT_PERMISSION.MANAGE && <span>
              <Button type="primary"
                icon={<PlusOutlined />}
                onClick={() => this.setState({ activeKey: '1' }, () => this.user.openCreate())}>
                添加用户
              </Button>
              <Button type="primary"
                className='u-mgl10'
                icon={<PlusOutlined />}
                onClick={() => this.setState({ activeKey: '2', sameRoleGroup: roleGroup }, () => this.userGroup.openCreate())}>
                添加用户组
              </Button>
            </span>}
          </div>

          <div
            className='bgWhiteModel'
            style={{ padding: '0px 12px' }}
          >
            <Tabs activeKey={activeKey} onChange={(value) => this.setState({ activeKey: value, sameRoleGroup: roleGroup })}>
              <TabPane tab="用户" key={'1'}>
                <User
                  getThis={(ref) => this.user = ref}
                  roleGroup={roleGroup}
                  {...this.props}/>
              </TabPane>

              <TabPane tab="用户组" key={'2'}>
                <UserGroup
                  getThis={(ref) => this.userGroup = ref}
                  sameRoleGroup={sameRoleGroup}
                  {...this.props}/>
              </TabPane>
            </Tabs>
          </div>


        </Card>

      </div>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    currentMemberInfo: state.user.currentMemberInfo,
  };
};


export default connect(mapStateToProps)(MangeMember);
