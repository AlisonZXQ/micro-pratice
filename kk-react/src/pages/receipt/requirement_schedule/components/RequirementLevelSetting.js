import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Radio, Divider, InputNumber, Switch, Col, Row, message } from 'antd';
import Modal from '@components/CustomAntd/modal';
import { REQUIREMENT_LEVEL_SETTING, DRAG_SETTING } from '@shared/ReceiptConfig';
import MyIcon from '@components/MyIcon';
import PopoverTip from '@components/PopoverTip';
import { saveRequirementLevelSetting } from '@services/requirement_pool';
import { settingData, getRequirementSettingConfig, saveRequirementSettingConfig, getChangeOrNot } from './CommonScheduleFun';
import styles from '../index.less';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

function RequirementLevelSetting({
  form,
  form: { getFieldDecorator, setFieldsValue, getFieldValue, getFieldsValue },
  refreshFun,
  productId,
  getSettingRule,
}) {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState(REQUIREMENT_LEVEL_SETTING.AUTO);
  const [sortType, setSortType] = useState(DRAG_SETTING.USE);
  const [defaultObj, setDefaultObj] = useState({});
  const [loading, setLoading] = useState(false);

  const getSettingRuleFun = () => {
    setVisible(true);
    getSettingRule().then(res => {
      setFieldsValue({
        ...getRequirementSettingConfig(res.result),
      });
      setType(res.result.type);
      setDefaultObj(res.result);
    });
  };

  const handleOk = () => {
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (type === REQUIREMENT_LEVEL_SETTING.DRAG && defaultObj.type === REQUIREMENT_LEVEL_SETTING.DRAG) {
        return message.warn('当前规则未发生变动！');
      }
      if (type === REQUIREMENT_LEVEL_SETTING.AUTO && defaultObj.type === REQUIREMENT_LEVEL_SETTING.AUTO && !getChangeOrNot(values, getRequirementSettingConfig(defaultObj))) {
        return message.warn('当前规则未发生变动！');
      }
      const params = {
        productId,
        type,
        sortType,
        ...saveRequirementSettingConfig(values),
      };
      setLoading(true);
      saveRequirementLevelSetting(params).then(res => {
        setLoading(false);
        if (res.code !== 200) return message.error(res.msg);
        setVisible(false);
        refreshFun();
        getSettingRule();
        message.success('操作成功！');
      }).catch(err => {
        setLoading(false);
        return message.error(err || err.message);
      });
    });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (<span>
    <Modal
      title="设置规则"
      visible={visible}
      onCancel={() => handleCancel()}
      footer={<span>
        <Button onClick={() => handleCancel()}>取消</Button>
        <Button onClick={() => handleOk()} type="primary" loading={loading}>更新</Button>
      </span>}
      width={800}
    >
      规则类型：
      <RadioGroup onChange={(e) => setType(e.target.value)} value={type}>
        <Radio key={REQUIREMENT_LEVEL_SETTING.DRAG} value={REQUIREMENT_LEVEL_SETTING.DRAG}>拖拽排序</Radio>
        <Radio key={REQUIREMENT_LEVEL_SETTING.AUTO} value={REQUIREMENT_LEVEL_SETTING.AUTO}>自动排序</Radio>
      </RadioGroup>

      {
        // type === REQUIREMENT_LEVEL_SETTING.DRAG && defaultObj.type === REQUIREMENT_LEVEL_SETTING.AUTO &&
        <div
          className={styles.dragDiv}
          style={{ display: type === REQUIREMENT_LEVEL_SETTING.DRAG && defaultObj.type === REQUIREMENT_LEVEL_SETTING.AUTO ? 'block' : 'none' }}
        >
          <RadioGroup value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <Radio key={DRAG_SETTING.USE} value={DRAG_SETTING.USE}>使用当前自动排序结果</Radio>
            <Radio key={DRAG_SETTING.NOT_USE} value={DRAG_SETTING.NOT_USE}>恢复拖拽排序结果</Radio>
          </RadioGroup>
        </div>
      }
      {
        // type === REQUIREMENT_LEVEL_SETTING.AUTO &&
        <div style={{ display: type === REQUIREMENT_LEVEL_SETTING.AUTO ? 'block' : 'none' }}>
          <Divider />
          <div className={styles.levelSettingName}>需求池排序规则</div>
          {
            settingData.map(item =>
              <Row>
                <Col span={4} className="f-tar">
                  <span className={styles.levelSettingText}>
                    {item.name}
                    {item.description &&
                      <PopoverTip trigger={<MyIcon type="icon-bangzhu" className="f-fs2" />} content={item.description} />}
                    ：
                  </span>
                </Col>
                <Col span={20}>
                  {item.options.map(it =>
                    <Col span={it.type === 'switch' ? 3 : 7}>
                      {
                        it.name && <span className={`u-mgr5 ${styles.levelSettingText}`}>{it.name}</span>
                      }
                      <FormItem style={{ display: 'inline-block' }}>
                        {it.id === 'state' &&
                          getFieldDecorator(`${item.id}-${it.id}`, {
                            valuePropName: 'checked',
                          })(
                            <Switch
                              checkedChildren="开"
                              unCheckedChildren="关"
                            />
                          )
                        }
                        {
                          it.id !== 'state' &&
                          getFieldDecorator(`${item.id}-${it.id}`, {
                            rules: [{
                              required: getFieldValue(`${item.id}-state`),
                              message: '此项必填！'
                            }, {
                              validator: (rule, value, callback) => {
                                if (it.id === 'unit' && value === 0) {
                                  callback('不能为0');
                                } else {
                                  callback();
                                }
                              }
                            }]
                          })(
                            <InputNumber
                              placeholder="请输入"
                              min={0}
                              precision={0}
                              disabled={!getFieldValue(`${item.id}-state`)}
                            />
                          )
                        }
                      </FormItem>
                      {
                        it.name && <span className={`u-mgl5 ${styles.levelSettingText}`}>{it.unit}</span>
                      }
                    </Col>)}
                </Col>
              </Row>
            )
          }
        </div>
      }
    </Modal>
    <Button type="primary" onClick={() => getSettingRuleFun()}>
      设置规则
    </Button>
  </span>);
}

export default Form.create()(RequirementLevelSetting);
