import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Input, DatePicker, Radio, Tag, Popover, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { queryUser } from '@services/project';
import MyIcon from '@components/MyIcon';
import TinyMCE from '@components/TinyMCE';
import ManPower from '@components/ManPower';
import { riskTypeColorMap, riskTypeNameMap, RISK_LEVEL_MAP } from '@shared/ProjectConfig';
import ReportTextDisplay from '../components/ReportTextDisplay';
import styles from '../index.less';

const formLayout = getFormLayout(4, 16);
const bigFormLayout = getFormLayout(2, 20);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const controls = [
  'headings', 'list-ul', 'list-ol', 'separator',
  'text-indent', 'separator',
  'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
  'remove-styles', 'separator',
  'link', 'media', 'separator',
  'clear', 'fullscreen', 'table', 'separator',
];

class ReportBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
    };
  }

  handleSearch = (value) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ ownerList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  emptyDisplay = (data) => {
    return data ? data : '-';
  }

  getDes = () => {
    const { reportData } = this.props;

    // 这里的getFieldDecorator的默认值恢复有问题，所以这里的富文本都需要这样处理
    this.props.dispatch({ type: 'design/saveDes', payload: reportData.description });
    return reportData && reportData.description ? reportData.description : '';
  }

  render() {
    const { form: { getFieldDecorator }, actionType, reportData, dataSource } = this.props;
    const { id } = this.props.location.query;
    const objectives = reportData.objectiveData || [];
    const timeRange = `${moment(reportData.starttime).format('YYYY-MM-DD')}
    ~${moment(reportData.endtime).format('YYYY-MM-DD')}`;

    const timeArr = (reportData.starttime && reportData.endtime) ? [moment(reportData.starttime),
      moment(reportData.endtime)] : undefined;

    return (<div className='bgWhiteModel' style={{ paddingTop: '20px' }}>
      <Row>
        <Col span={12} className="u-form">

          <FormItem label="日期" {...formLayout}>
            {
              actionType === 'view' ?
                timeRange :
                getFieldDecorator('timeRange', {
                  initialValue: timeArr,
                  rules: [{ required: true, message: '此项必填！' }]
                })(
                  <RangePicker
                    className="f-fw"
                    style={{ width: 300 }}
                    suffixIcon={<MyIcon type="icon-riqi" />} />
                )
            }
          </FormItem>

          <FormItem label="风险等级" {...formLayout} >
            {
              actionType === 'view' ?
                <Tag color={riskTypeColorMap[reportData.latestLevel]}>{riskTypeNameMap[reportData.latestLevel]}</Tag> :
                getFieldDecorator('level', {
                  initialValue: (reportData && reportData.latestLevel) ? Number(reportData.latestLevel) : undefined,
                  rules: [{ required: true, message: '此项必填！' }]
                })(
                  <Radio.Group onChange={this.onChange} disabled>
                    <Radio value={RISK_LEVEL_MAP.LOW}><Tag color={riskTypeColorMap[RISK_LEVEL_MAP.LOW]}>{riskTypeNameMap[RISK_LEVEL_MAP.LOW]}</Tag></Radio>
                    <Radio value={RISK_LEVEL_MAP.MIDDLE}><Tag color={riskTypeColorMap[RISK_LEVEL_MAP.MIDDLE]}>{riskTypeNameMap[RISK_LEVEL_MAP.MIDDLE]}</Tag></Radio>
                    <Radio value={RISK_LEVEL_MAP.HIGH}><Tag color={riskTypeColorMap[RISK_LEVEL_MAP.HIGH]}>{riskTypeNameMap[RISK_LEVEL_MAP.HIGH]}</Tag></Radio>
                  </Radio.Group>
                )
            }
          </FormItem>

          <FormItem label="项目目标" {...formLayout} className={styles.weekAims}>
            <div className={styles.overflowAim}>
              {
                (objectives && objectives.length) ? objectives.map(it => (
                  <div className={styles.projectAims}>
                    <Popover
                      content={it.summary}
                    >
                      <a className={`u-mgr10 f-ib f-toe`}
                        style={{ maxWidth: '27vw', height: 18 }}
                        href={it.jiraUrl}
                        rel="noopener noreferrer"
                        target="_blank">
                        {it.summary}
                      </a>
                    </Popover>
                  </div>
                )) : '-'
              }
            </div>
          </FormItem>
        </Col>

        <Col span={12} className="u-form">
          <FormItem label="项目负责人" {...formLayout} >
            {
              <Input className="f-fw" disabled value={reportData.responseUser && reportData.responseUser.realname} />
            }
          </FormItem>

          <FormItem label="人力预算" {...formLayout} >
            {
              <Input className="f-fw" disabled value={`${reportData && this.emptyDisplay(reportData.manpower)}人天`} />
            }
          </FormItem>

          <ManPower type="weekReport" id={id} formLayout={formLayout} dataSource={dataSource} />
        </Col>
      </Row>
      <Row>
        <Col className="u-mgt10">
          <FormItem label="项目详情描述" {...bigFormLayout}>
            {
              actionType === 'view' ?
                <ReportTextDisplay data={reportData && reportData.description} /> :
                getFieldDecorator('description', {
                  initialValue: this.getDes(),
                })(
                  <TinyMCE placeholder="请输入项目详情描述" controls={controls} extend height={450} />,
                )
            }
          </FormItem>
        </Col>
      </Row>
    </div>);
  }
}

export default connect()(ReportBase);
