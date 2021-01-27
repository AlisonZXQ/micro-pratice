import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, message } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { createBill } from '@services/receipt';
import CreateObjective from '@components/CreateIssues/create_objective';
import { getIssueCustom } from '@utils/helper';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';

function Index(props) {
  const { customSelect, productid, trigger } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = () => {
    props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段
      const params = {
        parentid: 0,
        issuetype: '',
        ...values,
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };
      params.issuetype = ISSUE_TYPE_JIRA_MAP.OBJECTIVE;
      setLoading(true);
      createBill(params).then((res) => {
        setLoading(false);
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        setVisible(false);
        const objective = res.result.objective || {};
        props.refreshFun({ id: objective.id });
      }).catch((err) => {
        setLoading(false);
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  };

  return (<span>
    <span onClick={(e) => { setVisible(true) }}>
      {trigger}
    </span>

    <Modal
      title="创建目标"
      visible={visible}
      onCancel={() => { setVisible(false); props.form.resetFields() }}
      width={1000}
      onOk={handleOk}
      okButtonProps={{ loading }}
      className="modal-createissue-height"
      destroyOnClose
    >
      <CreateObjective form={props.form} productid={productid} />
    </Modal>
  </span>);
}

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(Index)));
