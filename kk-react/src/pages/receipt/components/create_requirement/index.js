import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, message } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { getIssueCustom, getMentionUsers } from '@utils/helper';
import CreateRequirement from '@components/CreateIssues/create_requirement';
import { connTypeMap, ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import { create4RelationIssue, createBill } from '@services/receipt';

function Index(props) {
  const { customSelect, parentIssueId, trigger, productid, fixversionid, subProductId, subProductNoChange } = props;

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = () => {
    props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect);

      let promise = null;
      const params = {
        parentIssueType: connTypeMap["objective"],
        parentIssueId: parentIssueId,
        issuetype: ISSUE_TYPE_JIRA_MAP.REQUIREMENT,
        fixversionid: fixversionid || 0,
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };

      if (parentIssueId) {
        promise = create4RelationIssue;
      } else {
        promise = createBill;
      }

      setLoading(true);
      promise(params).then((res) => {
        setLoading(false);
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        setVisible(false);
        props.refreshFun();
      }).catch((err) => {
        setLoading(false);
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  };

  return (<span onClick={e => e.stopPropagation()}>
    <span onClick={() => { setVisible(true) }}>
      {trigger}
    </span>

    <Modal
      title="创建需求"
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={handleOk}
      width={1000}
      okButtonProps={{ loading }}
      destroyOnClose
    >
      <CreateRequirement
        form={props.form}
        productid={productid}
        fixversionid={fixversionid}
        subProductId={subProductId}
        subProductNoChange={subProductNoChange}
      />
    </Modal>
  </span>);
}

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(Index)));
