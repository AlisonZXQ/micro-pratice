import React, { useState, useImperativeHandle } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Radio, message } from 'antd';
import { connect } from 'dva';
import uuid from 'uuid';
import { updateAttachment } from '@services/requirement';
import { connTypeMapIncludeProject, ATTACHMENT_TYPE_MAP } from '@shared/CommonConfig';
import Local from './components/Local';
import Link from './components/Link';
import Dbox from './components/Dbox';
import styles from './index.less';

const RadioGroup = Radio.Group;

function Index(props) {
  const [visible, setVisible] = useState(false);
  const [upType, setUpType] = useState('local');
  const [dboxData, setDboxData] = useState([]);
  const { connid, type, issueRole, roleGroup, trigger } = props;

  //添加附件
  const doUpdateAttachment= (params) => {
    updateAttachment(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success(params.type === ATTACHMENT_TYPE_MAP.BLOB ? '添加文件附件成功！': '添加链接附件成功!');
      const attachmentParams = {
        conntype: connTypeMapIncludeProject[type],
        connid: connid,
      };
      props.dispatch({ type: 'receipt/getAttachmentCount', payload: attachmentParams });
      props.dispatch({ type: 'design/getReqAttachment', payload: attachmentParams });
      setVisible(false);
      handleReset();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const handleOk = () => {
    const { fromCreate, onChangeFile } = props;
    if(upType === 'link') {
      props.form.validateFields(['name', 'url'], (err, values) => {
        if (err) return;
        const {getFieldValue} = props.form;
        const urlValue = getFieldValue('url');
        const nameValue = getFieldValue('name');

        const params = {
          id: uuid(),
          type: ATTACHMENT_TYPE_MAP.LINK,
          name: nameValue ? nameValue.trim() : urlValue.trim(),
          url: urlValue.trim(),
          suffix: '',
          size: 0,
          connType: connTypeMapIncludeProject[type],
          connId: connid,
        };
        let arr = [];
        arr.push(params);
        if(fromCreate) {
          onChangeFile(arr);
          setVisible(false);
          handleReset();
        }else {
          doUpdateAttachment(arr);
        }
      });
    }else if(upType === 'local') {
      props.form.validateFields((err, values) => {
        let arr = values.attachments;
        if(!arr.length) {
          return message.warning('请先上传文件！');
        }
        arr.map(it => {
          it.connType = connTypeMapIncludeProject[type];
          it.connId = connid;
        });
        if(fromCreate) {
          onChangeFile(arr);
          setVisible(false);
          handleReset();
        }else {
          doUpdateAttachment(arr);
        }
      });
    }else if(upType === 'dbox') {
      if(!dboxData.length) {
        return message.warning('请先选择文件！');
      }
      let newDboxData = [];
      dboxData.forEach(it => {
        if(it.ext) {
          newDboxData.push({
            ...it,
            dboxId: it.id,
            url: it.previewUrl,
            suffix: it.ext,
            source: it.source,
            connType: connTypeMapIncludeProject[type],
            connId: connid,
          });
        }else {
          newDboxData.push({
            ...it,
            dboxId: it.id,
            url: it.previewUrl,
            suffix: '',
            type: ATTACHMENT_TYPE_MAP.LINK,
            connType: connTypeMapIncludeProject[type],
            connId: connid,
          });
        }

      });

      if(fromCreate) {
        onChangeFile(newDboxData);
        setVisible(false);
        handleReset();
      }else {
        doUpdateAttachment(newDboxData);
      }
    }
  };

  useImperativeHandle(props.cRef, () => ({
    //暴露给父组件的方法
    changeVisible: () => {
      setVisible(true);
    }
  }));

  const handleReset = () => {
    setUpType('local');
    setDboxData([]);
    sessionStorage.setItem('dboxActive', null);
  };

  return (<span>
    {trigger &&
      <span onClick={() => setVisible(true)}>{trigger}</span>
    }

    <Modal
      title='添加附件'
      visible={visible}
      width={650}
      destroyOnClose
      onCancel={() => {
        setVisible(false);
        handleReset();
      }}
      onOk={() => handleOk()}
    >
      <span>
        <div className={styles.content}>
          <div className={styles.header}>
            <RadioGroup
              value={upType}
              onChange={(e) => setUpType(e.target.value)}>
              <Radio value={'local'} className={styles.headerItem}>
                本地上传
              </Radio>
              <Radio value={'dbox'} className={styles.headerItem}>
                从DBOX
              </Radio>
              <Radio value={'link'} className={styles.headerItem}>
                添加其他链接
              </Radio>
            </RadioGroup>
          </div>

          <div className={upType === 'dbox' ? styles.dboxBody : styles.body}>
            {upType === 'local' && <span>
              <Local
                type={type}
                connid={connid}
                form={props.form}
                roleGroup={roleGroup}
                issueRole={issueRole} />
            </span>}

            {upType === 'dbox' && <span>
              <Dbox
                setDboxData={setDboxData}
                dboxData={dboxData}
              />
            </span>}

            {upType === 'link' && <span>
              <Link
                form={props.form}
              />
            </span>}
          </div>
        </div>
        {upType === 'dbox' &&
          <div className={styles.tip}>
            还未上传设计稿？使用
            <a href='http://axure.yixin.im/' target="_blank" rel="noopener noreferrer">D-BOX</a>
            上传
          </div>
        }

      </span>
    </Modal>
  </span>);
}

export default connect()(Form.create()(Index));
