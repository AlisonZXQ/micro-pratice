import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { history } from 'umi';
import BusinessHOC from '@components/BusinessHOC';
import FinishMsg from '@pages/project/project_finish/components/ApprovalMsg';
import { getFormLayout } from '@utils/helper';
import { PROJECT_STATUS_MAP } from '@shared/ProjectConfig';
import EditProjectTitleAndDescription from './components/EditProjectTitleAndDescription';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(8, 14);
const dateFormat = 'YYYY-MM-DD';

class CommonHeaderText extends Component {
  state = {
  };

  isEmptyData = (text) => {
    return text ? text : '--';
  }

  getCascadeField = (cascadeValueInfoList) => {
    const arr = [];
    cascadeValueInfoList.forEach(it => {
      if (it.cascadeCategory && !it.cascadeCategory.parentid) {
        const childObj = cascadeValueInfoList.find(item => item.cascadeField.id === it.cascadeField.id && !!item.cascadeCategory.parentid) || {};
        const childValue = childObj.cascadeCategory || {};
        arr.push({
          ...it.cascadeField,
          parentValue: it.cascadeCategory,
          childValue: Object.keys(childValue).length ? childValue : null,
        });
      }
    });
    return arr;
  }

  render() {
    const { projectBasic, down, currentMemberInfo } = this.props;
    const data = projectBasic.projectDetail || {};
    const createCustomFileds = projectBasic.createCustomFileds || [];
    const cascadeValueInfoList = projectBasic.cascadeValueInfoList || [];
    const cascadeField = this.getCascadeField(cascadeValueInfoList);
    const status = data.status;
    const projectClosureInforVO = projectBasic.projectClosureInforVO || {};
    const product = projectBasic.products && projectBasic.products[0] ? projectBasic.products[0] : {};
    const subProduct = projectBasic.subProductVO || {};
    const manager = data.managerList && data.managerList[0] ? data.managerList[0] : [];
    const roleGroup = currentMemberInfo.roleGroup;

    const getLabel = (text) => {
      return (
        <Tooltip title={text}>
          <span>{text.length > 8 ? `${text.slice(0, 8)}...` : text}</span>
        </Tooltip>
      );
    };

    return (<span className={styles.container}>
      <div className="u-mgt20">
        <EditProjectTitleAndDescription
          defaultValue={data.title}
          children={<span>
            <span className={`${styles.title} u-mgr10`} onClick={() => history.push(`/project/detail?id=${data.projectId}`)}>
              {this.isEmptyData(data.title)}
            </span>
            <span className="u-subtitle">（{this.isEmptyData(data.creator)}创建于
              {data.createTime ? moment(data.createTime).format('YYYY-MM-DD') : '-'}）
            </span>
          </span>}
          handleSave={(value) => this.props.handleUpdateProject('title', value)}
          roleGroup={roleGroup}
          type="title"
        />
      </div>

      <div className="u-mgt20">
        <FormItem label="项目描述" {...getFormLayout(4, 20)}>
          <EditProjectTitleAndDescription
            defaultValue={data.description}
            children={<span style={{ whiteSpace: 'pre-wrap', marginRight: '5px' }}>
              {this.isEmptyData(data.description)}
            </span>}
            handleSave={(value) => this.props.handleUpdateProject('description', value)}
            roleGroup={roleGroup}
            type="description"
          />
        </FormItem>
        {
          !down && <span>
            <Row>
              <Col span={12}>
                <FormItem label="关联产品" {...formLayout}>
                  {this.isEmptyData(product.name)}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem label="子产品" {...formLayout}>
                  {this.isEmptyData(subProduct.subProductName)}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <FormItem label="项目模板" {...formLayout}>
                  {this.isEmptyData(data.templateName)}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem label="项目代号" {...formLayout}>
                  {this.isEmptyData(data.projectCode)}
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <FormItem label="归属部门" {...formLayout}>
                  {this.isEmptyData(data.department)}
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem label="项目经理" {...formLayout}>
                  {this.isEmptyData(manager.name)}
                </FormItem>
              </Col>
            </Row>

            <Row>

              <Col span={12}>
                <FormItem label="项目周期" {...formLayout}>
                  {
                    (data.startTime && data.endTime) ? `${moment(data.startTime).format(dateFormat)} ~ ${moment(data.endTime).format(dateFormat)}` : '-'
                  }
                </FormItem>
              </Col>

              <Col span={12}>
                <FormItem label="人力预算" {...formLayout}>
                  {this.isEmptyData(data.budget)}人天
                </FormItem>
              </Col>
            </Row>

            {/* 创建项目的自定义字段 */}
            <Row>
              {
                createCustomFileds && createCustomFileds.map((it, index) => (
                  <Col span={12}>
                    <FormItem label={getLabel(it.customField && it.customField.name)} {...formLayout}>
                      {this.isEmptyData(it.label)}
                    </FormItem>
                  </Col>
                ))
              }
            </Row>

            {/* 项目的级联字段 */}
            <Row>
              {
                cascadeField && cascadeField.map((it, index) => (
                  <Col span={12}>
                    <FormItem label={getLabel(it.fieldname)} {...formLayout}>
                      {it.parentValue && <span>{it.parentValue.name}</span>}
                      {it.childValue && <span>/{it.childValue.name}</span>}
                    </FormItem>
                  </Col>
                ))
              }
            </Row>

            {/* 结项的字段及自定义字段 */}
            {
              status === PROJECT_STATUS_MAP.FINISH &&
              <Row>
                <FinishMsg data={projectBasic} />
              </Row>
            }

            {/* 结项审批人和审批时间 */}
            {status === PROJECT_STATUS_MAP.FINISH &&
              <Row>
                <Col span={12}>
                  <FormItem label={"审批人"} {...formLayout}>
                    {this.isEmptyData(projectClosureInforVO.closureAuditUser)}
                  </FormItem>
                </Col>

                <Col span={12}>
                  <FormItem label={"审批时间"} {...formLayout}>
                    {this.isEmptyData(projectClosureInforVO.closureAuditDate)}
                  </FormItem>
                </Col>
              </Row>
            }
          </span>
        }

      </div>
    </span>);
  }
}

export default withRouter(BusinessHOC()(CommonHeaderText));
