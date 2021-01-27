import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Select, InputNumber, DatePicker, message } from 'antd';
import { getFormLayout, dateDiff } from '@utils/helper';
import Modal from '@components/CustomAntd/modal';
import { saveTimeBoxSetting } from '@services/time_box';
import { getTimeBoxSetting } from '@services/time_box';
import { getTimeBoxByTime } from '@services/time_box';
import { timeTypeArr, TIME_TYPE_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);
const { MonthPicker, WeekPicker } = DatePicker;

const Option = Select.Option;

function TimeBoxRule({ form, productid, getTimeBoxContent, productAdmin, getTimeBox }) {
  const [visible, setVisible] = useState(false);
  const { getFieldDecorator, getFieldsValue } = form;
  const [rule, setRule] = useState({});
  const [currentDoingObj, setCurrentDoingObj] = useState({});

  const getTimeBoxSettingFun = useCallback((conveyProductId) => {
    getTimeBoxSetting(conveyProductId || productid).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      setRule(res.result || {});
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, []);

  useEffect(() => {
    getTimeBoxSettingFun(productid);
  }, [productid]);

  const getDisabledDate = (current) => {
    return current < moment().endOf('day');
  };

  const getDisabledDateMonth = (current) => {
    return current < moment().endOf('month');
  };

  const getDisabledDateWeek = (current) => {
    return current < moment().endOf('week');
  };

  const handleOk = () => {
    form.validateFieldsAndScroll((err, values) => {

      if (err) return;
      let timeBegin = moment(values.timeBegin).format('YYYY-MM-DD');
      if (values.cycleType === TIME_TYPE_MAP.NORMAL_MONTH) {
        const timeArr = timeBegin.split('-');
        timeBegin = `${timeArr[0]}-${timeArr[1]}-01`;
      }
      const params = {
        customDays: values.customDays || 0,
        cycleType: values.cycleType,
        productId: productid,
        timeBegin,
      };

      saveTimeBoxSetting(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('设置时间规则成功！');
        setVisible(false);
        getTimeBox();
        getTimeBoxContent();
        getTimeBoxSettingFun();
      }).catch(err => {
        return message.error(err || err.message);
      });
    });
  };

  const getDoingRangeBox = () => {
    const today = moment().format('YYYY-MM-DD');
    const params = {
      productId: productid,
      time: today,
    };
    getTimeBoxByTime(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const timeBoxVOList = res.result.timeBoxVOList || [];
      const doingObj = timeBoxVOList.find(it => it.dateList.includes(today)) || {};
      setCurrentDoingObj(doingObj);
    }).catch(err => {
      message.error(err || err.message);
    });
  };

  const showTip = () => {
    const { timeBegin, timeEnd } = currentDoingObj;
    const timeBeginValue = moment(getFieldsValue().timeBegin).format('YYYY-MM-DD');
    return dateDiff(moment().format('YYYY-MM-DD'), timeBeginValue) === 1
      ||
      (timeBeginValue >= timeBegin && timeBeginValue <= timeEnd);
  };

  return (<span className={styles.timeBoxRule}>
    <Modal
      title="设置默认周期"
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => handleOk()}
      destroyOnClose
    >
      <FormItem label="周期" {...formLayout}>
        {
          getFieldDecorator('cycleType', {
            initialValue: rule.cycleType,
            rules: [{ required: true, message: '此项必填！' }],
          })(
            <Select
              className="f-fw"
              showSearch
              placeholder="请选择周期"
              optionFilterProp="children"
            >
              {timeTypeArr.map(it =>
                <Option key={it.key} value={it.key}>
                  {it.name}
                </Option>)}
            </Select>
          )
        }
      </FormItem>

      {
        getFieldsValue().cycleType === TIME_TYPE_MAP.CUSTOM_TIME &&
        <FormItem label="时间范围" {...formLayout}>
          {
            getFieldDecorator('customDays', {
              initialValue: rule.customDays || 1,
              rules: [
                { required: true, message: '此项必填！' },
                {
                  validator: (rule, value, callback) => {
                    if (value > 31 || value < 1) {
                      callback('不能少于1天，不能超过31天！');
                    } else {
                      callback();
                    }
                  }
                }
              ],
            })(
              <InputNumber min={1} max={31} style={{ width: '100%' }} precision={0} />
            )
          }
        </FormItem>
      }

      {
        <FormItem label="生效时间" {...formLayout}>
          {
            getFieldDecorator('timeBegin', {
              rules: [{ required: true, message: '此项必填！' }],
            })(
              getFieldsValue().cycleType === TIME_TYPE_MAP.NORMAL_MONTH ?
                <MonthPicker
                  disabledDate={getDisabledDateMonth}
                  className="f-fw"
                />
                :
                getFieldsValue().cycleType === TIME_TYPE_MAP.NORMAL_WEEK ?
                  <WeekPicker disabledDate={getDisabledDateWeek} className="f-fw"
                  />
                  :
                  <DatePicker disabledDate={getDisabledDate} className="f-fw"
                  />
            )
          }
          <div className={styles.tip}>设为默认周期后，未开启的时间盒将以该周期显示，不影响已开启和结束的时间盒</div>
          {
            getFieldsValue().timeBegin && showTip()
            &&
            <span className={`${styles.tip} delColor`}>若当天已在进行中的时间盒，则会直接切断该时间盒</span>
          }
          <div></div>
        </FormItem>
      }
    </Modal>
    <span className={styles.timeBegin}>生效时间：{rule.timeBegin || '-'}</span>
    {productAdmin &&
      <Button type="primary" onClick={() => { setVisible(true); getDoingRangeBox() }}>设置规则</Button>
    }
  </span>);
}

export default Form.create()(TimeBoxRule);
