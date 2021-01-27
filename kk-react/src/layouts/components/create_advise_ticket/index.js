import React, { useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Button, message, Checkbox, Row, Col, Popover, notification } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getIssueCustom, getMentionUsers, getSystemDescription } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { createFeedback4Workbench } from '@services/my_workbench';
import { ISSUE_TYPE_JIRA_MAP, issueUrlMap } from '@shared/ReceiptConfig';
import AdviseForm from './components/AdviseForm';
import TicketForm from './components/TicketForm';
import styles from './index.less';

function CreateAdviseTicket(props) {
  const { customList, data } = props;
  const [visible, setVisible] = useState(false);
  const [createOther, setChecked] = useState(false);
  const [createLoading, setLoading] = useState(false);
  const [active, setActive] = useState('advise');
  const defaultTab = data.key;

  useEffect(() => {
    if (defaultTab === 'feedback') {
      setActive('advise');
    } else {
      setActive(defaultTab);
    }
  }, [defaultTab]);

  const openNotification = (result) => {
    const beforeFix = active === 'advise' ? 'Feedback' : 'Ticket';
    const issueKey = `${beforeFix}-${result}`;

    const args = {
      message: <span>创建成功，点击查看问题
        <a
          href={`${issueUrlMap[active]}-${result}`}
          target="_blank"
          rel="noopener noreferrer"
        >{issueKey}</a>
      </span>,
      description:
        <span>
        </span>,
      duration: 5,
    };
    notification.open(args);
  };

  const handleOk = () => {
    props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { customSelect } = props;
      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段

      const params = {
        parentid: 0,
        issuetype: ISSUE_TYPE_JIRA_MAP[active.toUpperCase()],
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };
      setLoading(true);
      createFeedback4Workbench(params).then((res) => {
        setLoading(false);
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success(`新建成功！`);
        openNotification(res.result);
        if (createOther) {
          props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
          props.form.resetFields(['name', 'attachments']);
        } else {
          setVisible(false);
          props.form.resetFields();
          // getIssueListByPage();
          props.callback && props.callback(); // 跳转到建议tab
          props.dispatch({ type: 'myworkbench/getAdviseCount' });
        }
      }).catch((err) => {
        setLoading(false);
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  };

  const handleChange = (type) => {
    setActive(type);
    props.form.resetFields();
  };

  return (<span>
    <Modal
      title={"创建反馈"}
      visible={visible}
      className='modal-createissue-height'
      width={1000}
      onCancel={() => { setVisible(false) }}
      destroyOnClose
      footer={[
        <div style={{ textAlign: 'right' }}>
          <Checkbox
            onChange={(event) => { setChecked(event.target.checked) }} className='u-mgr10'>
            创建另一个
          </Checkbox>
          <Button onClick={() => {
            setVisible(false);
            props.callback && props.callback();
            props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
          }}>取消</Button>
          <Button type='primary' onClick={() => handleOk()} loading={createLoading}>创建</Button>
        </div>
      ]}
    >
      <Row>
        <Col span={3}>
          <span className='f-fr'>场景类型：</span>
        </Col>
        <Col span={20}>
          <span
            className={`${styles.selectCard} ${active === 'advise' ? styles.activeSelect : ''}`}
            onClick={() => handleChange('advise')}>
            <div>
              <MyIcon type='icon-jianyi' className={styles.icon} />
              <span className={styles.title}>创建建议</span>
            </div>
            <span className={styles.content}>产品的功能与体验改进建议</span>
          </span>
          <span
            className={`${styles.selectCard} ${active === 'ticket' ? styles.activeSelect : ''}`}
            onClick={() => handleChange('ticket')}>
            <div>
              <MyIcon type='icon-gongdan' className={styles.icon} />
              <span className={styles.title}>创建工单</span>
            </div>
            <span className={styles.content}>产品使用过程中遇到的问题</span>
          </span>
        </Col>
      </Row>
      {active === 'advise' &&
        <AdviseForm {...props} />
      }
      {active === 'ticket' &&
        <TicketForm {...props} />
      }
    </Modal>
    <div
      className={styles.menuItem}
      onClick={() => {
        setVisible(true);
      }}>
      <MyIcon type={data.icon} />
      <span style={{ marginLeft: '8px' }}>
        {data.name}
      </span>
      <span className='u-mgl10'>
        <Popover content={data.tip}>
          <MyIcon type='icon-bangzhu' />
        </Popover>
      </span>
    </div>
  </span>);
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    allProductList: state.product.allProductList,
    customSelect: state.aimEP.customSelect,
    lastProduct: state.product.lastProduct,

    customList: state.receipt.customList,
  };
};

export default connect(mapStateToProps)(Form.create()(CreateAdviseTicket));
