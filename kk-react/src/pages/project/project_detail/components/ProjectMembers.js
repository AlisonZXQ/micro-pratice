import React, { Component } from 'react';
import { Card, Popover, Tag } from 'antd';
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import { PROJECT_STATUS_MAP, PROEJCT_PERMISSION } from '@shared/ProjectConfig';
import styles from '../index.less';

class DetailMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  handleManage = () => {
    const { id } = this.props;
    const { projectBasic } = this.props;
    const productid = projectBasic && projectBasic.products[0] && projectBasic.products[0].id;
    history.push(`/project/manage_members?id=${id}&productid=${productid}`);
  }

  content = (isOwner, isManager, userVo) => {
    const { email } = userVo;
    const { projectMemberRoleRelationVOList } = userVo;
    return (
      <div>
        <p>{email}</p>
        {isOwner && !isManager && <Tag>项目负责人</Tag>}
        {isManager && !isOwner && <Tag>项目经理</Tag>}
        {isManager && isOwner && <span><Tag>项目负责人</Tag><Tag>项目经理</Tag></span>}
        {projectMemberRoleRelationVOList.length > 0 ? projectMemberRoleRelationVOList.map((item) => (
          <Tag style={{ marginRight: '2px', marginLeft: '2px' }}>{item.role_name}</Tag>
        )) : !isOwner && !isManager ? '暂无' : ''}
      </div>
    );
  }

  render() {
    const { projectBasic, projectMember, currentMemberInfo } = this.props;
    const projectDetail = projectBasic.projectDetail || {};
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;

    return (<span className={styles.displayMembers}>
      <div className="bbTitle">
        <span className="name">项目成员({projectMember && projectMember.uniqueUserCount})</span>
        {
          projectDetail.status !== PROJECT_STATUS_MAP.FINISH && roleGroup === PROEJCT_PERMISSION.MANAGE &&
          <a className="f-aic f-fr f-fs2" onClick={() => this.handleManage()}>
            管理
            <MyIcon type="icon-fanhuitubiao" className={styles.icon} />
          </a>
        }
      </div>
      <Card>
        {
          projectMember && projectMember.members && projectMember.members.map(it => (
            <Popover
              content={this.content(it.isOwner, it.isManager, it.userVO)}>
              <div className={styles.projectMembers}>
                <div className={styles.lastWord}>
                  {it.userVO.name && it.userVO.name.slice(it.userVO.name.length - 1)}
                </div>

                <span className={`${styles.name} f-toe f-ib u-mgb10`}>{it.userVO.name}（
                  {
                    it.userVO.email
                  }
                </span>

                <span className={styles.icon}>
                  {
                    it.isOwner &&
                    <MyIcon type='icon-owner' />
                  }
                </span>

              </div>
            </Popover>))
        }
      </Card>
    </span>);
  }

}

export default DetailMembers;
