import React, {useCallback, useState} from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Upload, message, Dropdown, Menu, Modal, Input } from 'antd';
import { connect } from 'dva';
import uuid from 'uuid';
import { getFormLayout } from '@utils/helper';
import { uploadFile, updateAttachment } from '@services/requirement';
import { connTypeMapIncludeProject, ATTACHMENT_TYPE_MAP } from '@shared/CommonConfig';

function Index(props) {
  const { children, connid, type } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { getFieldDecorator } = props.form;
  const MenuItem = Menu.Item;
  const FormItem = Form.Item;
  const formLayout = getFormLayout(6, 18);

  const beforeUpload = useCallback((file) => {
    const isLt2M = file.size / 1024 / 1024 < 40;
    if (!isLt2M) {
      message.error('单个文件必须小于40MB!');
    }
    return isLt2M;
  }, []);


  //添加附件
  const doUpdateAttachment= useCallback((params) => {
    updateAttachment(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success(params.type === ATTACHMENT_TYPE_MAP.BLOB ? '添加文件附件成功！': '添加链接附件成功!');
      const attachmentParams = {
        conntype: connTypeMapIncludeProject[type],
        connid: connid,
      };
      props.dispatch({ type: 'design/getReqAttachment', payload: attachmentParams });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, [type, connid]);

  const customRequest = useCallback((option) => {
    const formData = new FormData();
    formData.append('file', option.file);

    setMenuVisible(false);

    uploadFile(formData).then(res => {
      if (res.code !== 200) return message.error(res.msg);

      const params = {
        ...res.result,
        type: ATTACHMENT_TYPE_MAP.BLOB,
        conntype: connTypeMapIncludeProject[type],
        connid: connid,
      };

      doUpdateAttachment(params);

    }).catch((err) => {
      return message.error(err || err.message);
    });
  }, [type, connid, doUpdateAttachment]);

  const handleAddLink = useCallback((e) => {
    e.stopPropagation();
    setVisible(true);
    setMenuVisible(false);
  }, []);

  const handleAddLinkOk = useCallback(() => {
    props.form.validateFields(['name', 'url'], (err, values) => {
      if (err) return;

      setLoading(true);
      const {getFieldValue} = props.form;
      const urlValue =getFieldValue('url');
      const nameValue = getFieldValue('name');

      const params = {
        id: uuid(),
        type: ATTACHMENT_TYPE_MAP.LINK,
        name: nameValue.trim(),
        url: urlValue.trim(),
        suffix: '',
        size: 0,
        conntype: connTypeMapIncludeProject[type],
        connid: connid,
      };

      doUpdateAttachment(params);

      setLoading(false);
      setVisible(false);
    });
  }, [type, connid, doUpdateAttachment]);

  const menuMore = useCallback(() => {
    return (<Menu>
      <MenuItem key="添加文件" className="f-tac">
        <Upload
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          showUploadList={false}
        >
          添加文件
        </Upload>
      </MenuItem>
      <MenuItem key="添加链接" className="f-tac">
        <a onClick={handleAddLink}>添加链接</a>
      </MenuItem>
    </Menu>);
  }, [beforeUpload, customRequest, handleAddLink]);

  const validFunction4Url = (rule, value, callback) =>{
    const {getFieldValue} = props.form;
    const urlValue =getFieldValue('url');
    if (urlValue){
      if(!/^(http:\/\/|https:\/\/)/.test(urlValue)){
        callback('地址必须以http://或https://为前缀');
      }
      else{
        callback();
      }
    }
    else{
      callback();
    }
  };

  return (<span>
    <Dropdown overlay={menuMore()}
      trigger={['click']}
      onClick={e => e.stopPropagation()}
      visible={menuVisible}
      onVisibleChange={(visible)=> setMenuVisible(visible)}>
      {children}
    </Dropdown>
    <Modal
      title="添加链接附件"
      visible={visible}
      onOk={() => handleAddLinkOk()}
      onCancel={() => setVisible(false)}
      okButtonProps={{ loading: loading }}
      destroyOnClose
      maskClosable={false}
    >
      <FormItem label="名称" {...formLayout}>
        {getFieldDecorator('name', {
          rules: [
            { required: true, message: `此项不能为空` },
          ],
        })(
          <Input placeholder="请输入链接名称，不超过50字" className="f-fw" maxLength={50} />
        )}
      </FormItem>

      <FormItem label="地址" {...formLayout}>
        {getFieldDecorator('url', {
          rules: [
            { required: true, message: `此项不能为空` },
            { validator: validFunction4Url }
          ],
        })(
          <Input placeholder="请输入链接地址，不超过255字" className="f-fw" maxLength={255} />
        )}
      </FormItem>
    </Modal>
  </span>);
}

export default connect()(Form.create()(Index));
