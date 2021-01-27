import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Dropdown, Button, Menu, Modal, Popover, message, notification } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { withRouter } from 'react-router-dom';
import MyIcon from '@components/MyIcon';
import moment from 'moment';
import { getIssueCustom, getMentionUsers, firstWordToUpperCase, getSystemDescription } from '@utils/helper';
import { issue_type_name_map, issueUrlMap } from '@shared/ReceiptConfig';
import { createBill } from '@services/receipt';
import CreateObjective from '@components/CreateIssues/create_objective';
import CreateRequirement from '@components/CreateIssues/create_requirement';
import CreateTask from '@components/CreateIssues/create_task';
import CreateBug from '@components/CreateIssues/create_bug';
import { createFeedback4Workbench } from '@services/my_workbench';
import CreateAdviseOrTicket from '../create_advise_ticket';
import styles from './index.less';

const feedbackArr = [{
  key: 'feedback',
  name: '建议',
  icon: 'icon-jianyi1',
  tip: '产品的功能与体验改进建议'
}, {
  key: 'ticket',
  name: '工单',
  icon: 'icon-gongdan1',
  tip: '产品使用过程中遇到的问题'
}];

const issuesArr = [
  //   {
  //   key: 'objective',
  //   name: '目标',
  //   icon: 'icon-mubiao'
  // },
  {
    key: 'feature',
    name: '需求',
    icon: 'icon-xuqiu1'
  }, {
    key: 'task',
    name: '任务',
    icon: 'icon-renwu1'
  }, {
    key: 'bug',
    name: '缺陷',
    icon: 'icon-quexian1'
  }];

function Index({ form, customList, lastProduct, allProductList, customSelect, productList, location, ...rest }) {
  const [visible, setVisible] = useState(false);
  const [dropDownVisible, setDropDownVisible] = useState(visible);
  const [current, setCurrent] = useState(''); // 当前选择的单据类型
  const [createLoading, setCreateLoading] = useState(false);
  const { pathname, search } = location;

  /**
   * 除建议和工单外的默认产品设置
     1.在产品管理页面里，取当前产品；
     2.如果上次有选择，则取上次选择过的；
     3.上次没有选择过的，取ep；
     4.没有ep权限，取产品列表的第一个
   */
  const getProductId = () => {
    let productId = 0;
    const localProductId = localStorage.getItem('last_select_product') || 0;
    const lastProductId = lastProduct.id || 0;
    const epId = (productList.find(it => it.name === 'Easy Project') || {}).id || 0;
    const firstId = (productList && productList[0] && productList[0].id) ? productList[0].id : 0;
    //产品管理页面
    if (pathname.includes('/manage') && lastProductId) {
      productId = lastProductId;
    } else if (localProductId && productList.some(it => it.id === Number(localProductId))) {
      productId = localProductId;
    } else if (epId && productList.some(it => it.id === epId)) {
      productId = epId;
    } else {
      productId = firstId;
    }
    return productId;
  };

  // 工单和建议需要加文字说明
  const menu = () => {
    return (<Menu>
      <div className={styles.title}>反馈</div>
      {
        feedbackArr.map(it =>
          <div onClick={() => setDropDownVisible(false)}>
            <CreateAdviseOrTicket data={it} />
          </div>
        )
      }

      {
        !!productList.length &&
        <span>
          <div className={styles.title}>工作项</div>
          {
            issuesArr.map(it =>
              <div
                className={styles.menuItem}
                onClick={() => {
                  setVisible(true);
                  setCurrent(it.key);
                }}>
                <MyIcon type={it.icon} />
                <span style={{ marginLeft: '8px' }}>
                  {it.name}
                </span>
              </div>)
          }
        </span>
      }

      <div className={styles.divider}></div>
      <div className={styles.menuItem}>
        <MyIcon type="icon-xiangmu" />
        <span style={{ marginLeft: '8px' }} onClick={() => history.push('/project/create_project')}>
          项目
        </span>
      </div>
    </Menu>);
  };

  const openNotification = (result) => {
    let issueId = 0;
    // 目标返回的是全部的数据，其他就是一个id
    if (current === 'objective') {
      let resultObj = result || {};
      const issue = resultObj[current] || {};
      issueId = issue.id;
    } else {
      issueId = result;
    }

    const issueKey = `${firstWordToUpperCase(current)}-${issueId}`;

    const args = {
      message: <span>创建成功，点击查看问题
        <a
          href={`${issueUrlMap[current]}-${issueId}`}
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

  // 五类单据创建统一处理
  const handleOk = () => {
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      let type = '';
      if (current === 'task' || current === 'bug' || current === 'ticket') {
        type = issue_type_name_map[current];
      } else if (current === 'feature') {
        type = issue_type_name_map['story'];
      } else if (current === 'objective') {
        type = issue_type_name_map['epic'];
      } else if (current === 'feedback') {
        type = issue_type_name_map['advise'];
      }

      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段

      const params = {
        parentid: 0,
        issuetype: type,
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };

      let promise = null;
      if (current === 'feedback' || current === 'ticket') {
        promise = createFeedback4Workbench;
      } else {
        promise = createBill;
      }
      setCreateLoading(true);
      promise(params).then((res) => {
        setCreateLoading(false);
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        setVisible(false);
        form.resetFields();
        openNotification(res.result);
      }).catch((err) => {
        setCreateLoading(false);
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  };

  return (<span className={styles.createIssue}>
    <Dropdown
      overlay={menu}
      visible={dropDownVisible}
      onVisibleChange={visible => setDropDownVisible(visible)}
    >
      <MyIcon type="icon-chuangjian" className={styles.createIcon} />
    </Dropdown>
    <Modal
      title={`创建${(issuesArr.find(it => it.key === current) || {}).name || '工作项'}`}
      visible={visible}
      onCancel={() => {
        form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
        setVisible(false);
      }}
      className='modal-createissue-height'
      footer={<span>
        <Button onClick={() => {
          form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
          setVisible(false);
        }}>取消</Button>
        <Button
          type='primary'
          onClick={() => handleOk()}
          loading={createLoading}>创建</Button>
      </span>}
      width={1000}
      destroyOnClose
    >
      {
        current === 'objective' && <CreateObjective form={form} showProduct productid={getProductId()} />
      }
      {
        current === 'feature' && <CreateRequirement form={form} showProduct productid={getProductId()} />
      }
      {
        current === 'bug' && <CreateBug form={form} showProduct productid={getProductId()} />
      }
      {
        current === 'task' && <CreateTask form={form} showProduct productid={getProductId()} />
      }
    </Modal>
  </span>);
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
    allProductList: state.product.allProductList,
    customSelect: state.aimEP.customSelect,
    customList: state.receipt.customList || [],
    productList: state.product.productList,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(Index)));
