import React, { Component } from 'react';
import { Popover, Spin, Card, Empty } from 'antd';
import { history } from 'umi';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import link from '@assets/link.png';
import { PROEJCT_PERMISSION } from '@shared/ProjectConfig';
import { ATTCHEMENT_TYPE_MAP, pictureTypeArr } from '@shared/CommonConfig';
import styles from '../index.less';

class ProjectAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { id } = this.props;
    if (id) {
      this.getDefaultRequest(id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.id !== this.props.id) {
      this.getDefaultRequest(this.props.id);
    }
  }

  getDefaultRequest = (id) => {
    const attachmentParams = {
      conntype: 6,
      connid: id,
    };
    this.props.dispatch({ type: 'design/getReqAttachment', payload: attachmentParams });
  }

  handleManage = () => {
    const { id } = this.props;
    const { projectBasic } = this.props;
    const productid = projectBasic && projectBasic.products[0] && projectBasic.products[0].id;
    history.push(`/project/project_attachment?id=${id}&productid=${productid}`);
  }

  handleDownLoad = (it) => {
    window.open(`/rest/download/attachment?url=${it.url}&name=${it.name}`);
  }

  render() {
    const { reqAttachment, loading, currentMemberInfo } = this.props;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;

    return (<span className={styles.projectAttachment}>
      <Spin spinning={loading}>
        <div className="bbTitle">
          <span className="name">项目附件({reqAttachment && reqAttachment.length})</span>
          {roleGroup !== PROEJCT_PERMISSION.READ &&
            <a className="f-aic f-fr f-fs2" onClick={() => this.handleManage()}>
              管理
              <MyIcon type="icon-fanhuitubiao" className={styles.icon} />
            </a>
          }
        </div>
        {reqAttachment && reqAttachment.length > 0 ? <Card className={styles.attachmentContent}>
          {reqAttachment && reqAttachment.map((it) => (
            <div className={`f-aic ${styles.item}`}>
              {it.attachment.dboxId &&
                <div className={`f-jcc-aic ${styles.linkIcon}`}>
                  <MyIcon type='icon-D-BOX' style={{ fontSize: '10px' }} />
                </div>
              }
              {!it.attachment.dboxId && it.attachment.type === ATTCHEMENT_TYPE_MAP.LINK && <div className={`f-jcc-aic ${styles.linkIcon}`}>
                <MyIcon type='icon-link1' style={{ fontSize: '10px' }} />
              </div>
              }
              {!it.attachment.dboxId && it.attachment.type === ATTCHEMENT_TYPE_MAP.BINARY && <img
                src={
                  pictureTypeArr.includes(it.attachment.suffix) ?
                    it.attachment.url : link
                }
                className={styles.annexImg}
                alt='图片' />
              }
              <Popover content={
                it.attachment.dboxId ? `${it.attachment.name}${it.attachment && it.attachment.suffix ? '.' + it.attachment.suffix : ''}` : it.attachment.name
              }>
                <span className={`f-toe ${styles.attachmentName}`}>
                  {it.attachment.dboxId && <span>
                    {it.attachment.name}{it.attachment && it.attachment.suffix ? '.' + it.attachment.suffix : ''}
                  </span>}
                  {!it.attachment.dboxId && it.attachment.name}
                </span>
              </Popover>
              {it.attachment.type === ATTCHEMENT_TYPE_MAP.LINK && <a
                className={styles.downLoad}
                href={it.attachment.url} target="_blank" rel="noopener noreferrer">查看</a>}

              {it.attachment.type === ATTCHEMENT_TYPE_MAP.BINARY && <a
                className={styles.downLoad}
                onClick={() => this.handleDownLoad(it.attachment)}
                download=''>下载</a>}
            </div>
          ))}
        </Card> : <Card className={styles.attachmentContent}>
          <Empty />
        </Card>}
      </Spin>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    reqAttachment: state.design.reqAttachment,
    loading: state.loading.effects['design/getReqAttachment'],
  };
};

export default connect(mapStateToProps)(ProjectAttachment);
