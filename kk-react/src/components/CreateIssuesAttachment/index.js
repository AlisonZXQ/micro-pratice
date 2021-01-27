import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Row, Col, Popconfirm, Divider, Popover } from 'antd';
import MyIcon from '@components/MyIcon';
import { getHumanSize } from '@utils/helper';
import AttachmentModal from '@pages/receipt/components/attachment_modal';
import { ATTACHMENT_TYPE_MAP } from '@shared/CommonConfig';
import styles from './index.less';

function CreateIssuesAttachment(props) {
  const [fileList, setFileList] = useState([]);
  const [isList, setIsList] = useState(false);

  const handleDownload = (it) => {
    window.open(`/rest/download/attachment?url=${it.url}&name=${it.name}`);
  };

  const handleDelete = (id) => {
    const newFileList = [...fileList];
    setFileList(newFileList.filter(it => it.id !== id));
    props.onChange(newFileList.filter(it => it.id !== id));
  };

  const getDisplayList = (it) => {
    return (<span>
      <Col span={10}>
        <a href={it.url} target="_blank" rel="noopener noreferrer">{it.name}</a>
        {it.type === ATTACHMENT_TYPE_MAP.BLOB ?
          <span className={`f-tal f-ib u-mgl10 ${styles.listSize}`}>
            ({getHumanSize(it.size)})
          </span>
          : <span>&nbsp;</span>
        }
      </Col>
      <Col span={14}>
        <span className='f-fr'>
          {it.type === ATTACHMENT_TYPE_MAP.BLOB ?
            <a onClick={(e) => { e.stopPropagation(); handleDownload(it) }}>下载</a>
            : ''
          }

          <Popconfirm
            title="确定删除该附件吗?"
            onConfirm={() => handleDelete(it.id)}
            okText="确定"
            cancelText="取消"
          >
            {it.type === ATTACHMENT_TYPE_MAP.BLOB ? <Divider type="vertical" /> : ''}
            <span className='delColor f-csp'>删除</span>
          </Popconfirm>
        </span>
      </Col>
    </span>);
  };

  const getDisplayNotList = (it) => {
    return (
      <a href={it.url} target="_blank" rel="noopener noreferrer">
        <li className={styles.li}>
          <span className={styles.container}>
            <div className={styles.imgStyle}>
              {it.dboxId &&
                <MyIcon type='icon-D-BOX' style={{ fontSize: '26px' }} />
              }
              {!it.dboxId && it.type === ATTACHMENT_TYPE_MAP.LINK &&
                <MyIcon type='icon-link1' style={{ fontSize: '26px' }} />
              }
              {!it.dboxId && it.type === ATTACHMENT_TYPE_MAP.BINARY &&
                <img
                  src={it.url}
                  alt={it.name}
                />
              }
            </div>
            <div className='f-aic' style={{ height: '30px' }}>
              <Popover content={it.name} trigger="hover">
                <span className={`f-toe ${styles.name}`}>{it.name}</span>
              </Popover>
            </div>
          </span>
          <div style={{ marginTop: '4px' }} className="f-fs1">
            {it.type === ATTACHMENT_TYPE_MAP.BLOB ?
              <span className={styles.notListSize}>{getHumanSize(it.size)}</span>
              : <span>&nbsp;</span>
            }

            <span className="f-fr">
              {it.type === ATTACHMENT_TYPE_MAP.BLOB ?
                <a
                  onClick={(e) => { e.stopPropagation(); handleDownload(it) }}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: '6px' }}
                >下载
                </a>
                : ''
              }

              <Popconfirm
                title="确定删除该附件吗?"
                onConfirm={() => handleDelete(it.id)}
                okText="确定"
                cancelText="取消"
              >
                <a className="delColor">删除</a>
              </Popconfirm>
            </span>
          </div>
        </li>
      </a>);
  };

  const createButton = () => {
    return (
      <span>
        <Button type='dashed' icon={<PlusOutlined />}>
          点击添加
        </Button>
      </span>
    );
  };

  const onChangeFile = (data) => {
    const newData = [...fileList, ...data];
    setFileList(newData);
    props.onChange(newData);
  };

  return <span>
    {
      !!fileList.length &&
      <div className="f-tar u-mgt10 u-mgb10">
        <a
          className={!isList ? styles.default : ''}
          onClick={() => setIsList(true)}>
          <MyIcon type="icon-liebiaozhanshi" className="f-csp" />
          <span className='u-mgl5'>列表</span>
        </a>
        <a
          className={`u-mgl10 ${isList ? styles.default : ''}`}
          onClick={() => setIsList(false)}>
          <MyIcon type="icon-tupianzhanshi" className="f-csp" />
          <span className='u-mgl5'>缩略图</span>
        </a>
      </div>
    }

    {
      isList &&
      fileList.map(it =>
        <Row className="u-mgt5">
          {getDisplayList(it)}
        </Row>)
    }
    {
      !isList &&
      fileList.map(it =>
        <ul className={styles.ul}>
          {getDisplayNotList(it)}
        </ul>)
    }
    <AttachmentModal
      trigger={createButton()}
      issueRole={props.issueRole}
      onChangeFile={onChangeFile}
      fromCreate
    />
  </span>;
}

export default CreateIssuesAttachment;
