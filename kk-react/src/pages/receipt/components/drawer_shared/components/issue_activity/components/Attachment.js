import React, { useEffect } from 'react';
import { Row, Col, Popconfirm, Divider, message, Empty } from 'antd';
import { connect } from 'dva';
import BusinessHOC from '@components/BusinessHOC';
import MyIcon from '@components/MyIcon';
import { getHumanSize } from '@utils/helper';
import { deleteAttachment } from '@services/receipt';
import { connTypeMapIncludeProject, ISSUE_ROLE_VALUE_MAP, ATTACHMENT_TYPE_MAP, pictureTypeArr } from '@shared/CommonConfig';
import link from '@assets/link.png';
import styles from '../index.less';

function Attachment(props) {
  const { reqAttachment, type, connid, isBusiness, issueRole, currentUser } = props;

  useEffect(() => {
    const attachmentParams = {
      conntype: connTypeMapIncludeProject[type],
      connid: connid,
    };
    props.dispatch({ type: 'design/getReqAttachment', payload: attachmentParams });
  }, [connid, type]);

  const getExtraFile = () => {
    const arr = [];
    if (reqAttachment) {
      reqAttachment.forEach(it => {
        if (it.attachment) {
          arr.push({
            ...it.attachment,
            attachmentId: it.attachment.id,
          });
        }
      });
    }
    return arr;
  };

  const handleDownload = (it) => {
    if(it.dboxId) {
      window.open(it.url);
    }else {
      window.open(`/rest/download/attachment?url=${it.url}&name=${it.name}`);
    }
  };

  const handleDelete = (id) => {
    deleteAttachment({ id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('删除附件成功!');
      const attachmentParams = {
        conntype: connTypeMapIncludeProject[type],
        connid: connid,
      };
      props.dispatch({ type: 'design/getReqAttachment', payload: attachmentParams });
      props.dispatch({ type: 'receipt/getAttachmentCount', payload: attachmentParams });
    }).catch(err => {
      return message.error(err || err.message);
    });
  };


  const hasPermission4Delete = (issueRole, uploadUid, currentUser) => {
    return issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE
      || (currentUser && currentUser.user && currentUser.user.id === uploadUid);
  };

  const getUrl = (it) => {
    if(pictureTypeArr.includes(it.suffix)) {
      if(isBusiness) {
        return it.url;
      }else {
        return `${it.url}?imageView&thumbnail=400x300`;
      }
    }else {
      return link;
    }
  };

  return (<div className={styles.attachment}>
    {getExtraFile().length ?
      getExtraFile().map(it =>
        <Row className="u-mgt5">
          <Col span={16}>
            <a
              style={{ position: 'relative', top: '-5px' }}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {it.dboxId &&
                <span className={styles.imgStyle}>
                  <MyIcon type='icon-D-BOX' />
                </span>
              }
              {!it.dboxId && <span className={styles.imgStyle}>
                <img
                  src={getUrl(it)}
                  alt={it.name}
                  style={{ position: 'relative', top: '-10px' }}
                />
              </span>}
              <span className={`f-ib f-toe ${styles.attachmentName}`}>
                {it.dboxId && `${it.name}${it.suffix ? '.' + it.suffix : ''}`}
                {!it.dboxId && it.name}
              </span>
            </a>
          </Col>
          <Col span={4} style={{ lineHeight: '40px' }}>
            <span className={styles.attachmentSize}>
              { it.type === ATTACHMENT_TYPE_MAP.BLOB ? getHumanSize(it.size) : ''}
            </span>
          </Col>
          <Col span={4} style={{ lineHeight: '40px' }} className="f-tar">
            {it.type === ATTACHMENT_TYPE_MAP.BLOB ? <a onClick={(e) => { e.stopPropagation(); handleDownload(it) }}>下载</a> : ''}
            {
              hasPermission4Delete(issueRole, it.optuid, currentUser) ?
                <Popconfirm
                  title="确定删除该附件吗?"
                  placement='topRight'
                  onConfirm={() => handleDelete(it.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  { it.type === ATTACHMENT_TYPE_MAP.BLOB ? <Divider type="vertical" /> : '' }
                  <span className='delColor f-csp'>删除</span>
                </Popconfirm>
                :
                ''
            }
          </Col>
        </Row>)
      : <Empty />
    }
  </div>);
}

const mapStateToProps = (state) => {
  return {
    reqAttachment: state.design.reqAttachment,
    currentUser: state.user.currentUser
  };
};

export default connect(mapStateToProps)(BusinessHOC()(Attachment));
