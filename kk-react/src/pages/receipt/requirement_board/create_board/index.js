import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Modal, Input, Radio, Select, message } from 'antd';
import { addKanban } from '@services/requirement_board';
import { getFilterList } from '@services/advise';
import { RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import { BOARD_FILTER_TYPE } from '@shared/RequirementConfig';
import { getFormLayout } from '@utils/helper';
import RequireForm from '../components/require_form';

const formLayout = getFormLayout(5, 17);
const FormItem = Form.Item;
const Option = Select.Option;

function Index(props) {
  const [visible, setVisible] = useState(false);
  const [nextVisible, setNextVisible] = useState(false);
  const [filterList, setFilterList] = useState([]);
  const [checkList, setCheckList] = useState([]);

  const { form: { getFieldDecorator, getFieldValue, resetFields }, getKanbanList, kanbanList, setCurrentKanban } = props;

  const handleOk = () => {
    props.form.validateFields((err, values) => {
      if (err) return;
      const params = {
        ...values,
        productId: props.productid,
        requirementIdList: checkList,
      };
      if(params.filterId === 'all' || params.filterId === 'allOpen') {
        params.type = params.filterId === 'all' ? BOARD_FILTER_TYPE.ALL : BOARD_FILTER_TYPE.ALL_OPEN;
        params.filterId = 0;
      }
      addKanban(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        setVisible(false);
        setNextVisible(false);
        getKanbanList();
        resetFields();
        setCurrentKanban(res.result || {});
        message.success('创建成功');
      }).catch(err => {
        return message.error(err.message);
      });
    });
  };

  const openBoard = () => {
    setVisible(true);
    const params = {
      type: RECEIPT_LOG_TYPE.REQUIREMENT,
      productid: props.productid,
    };
    getFilterList(params).then((res) => { //获取过滤器列表
      if (res.code !== 200) { return message.error(res.msg) }
      setFilterList(res.result);
    }).catch((err) => {
      return message.error(err || err.message);
    });
  };

  const handleNext = () => {
    props.form.validateFields((err, values) => {
      if (err) return;
      setVisible(false);
      setNextVisible(true);
    });
  };

  const updateCheckList = (list) => {
    setCheckList([...list]);
  };

  return <span>
    <Button type='primary' onClick={() => openBoard()}>创建看板</Button>
    <Modal
      title='创建看板'
      visible={visible}
      onCancel={() => setVisible(false)}
      footer={
        <span>
          <Button onClick={() => { setVisible(false); setCheckList([]); resetFields() }}>取消</Button>
          {getFieldValue('type') !== BOARD_FILTER_TYPE.CUSTOM &&
            <Button type='primary' onClick={() => handleOk()}>确定</Button>
          }
          {getFieldValue('type') === BOARD_FILTER_TYPE.CUSTOM &&
            <Button type='primary' onClick={() => handleNext()}>下一步</Button>
          }
        </span>
      }
    >
      <FormItem label='看板名称' {...formLayout}>
        {getFieldDecorator('name', {
          rules: [
            { required: true, message: '此项必填！' },
            {
              validator: (rule, value, callback) => {
                if (kanbanList.some(it => it.name === value)) {
                  callback('当前看版名称已存在！');
                } else {
                  callback();
                }
              }
            }
          ],
        })(
          <Input placeholder='请输入' />
        )}
      </FormItem>

      <FormItem label='范围' {...formLayout}>
        {getFieldDecorator('type', {
          rules: [{ required: true, message: '此项必填' }]
        })(
          <Radio.Group defaultValue={BOARD_FILTER_TYPE.FILTER}>
            <Radio value={BOARD_FILTER_TYPE.FILTER}>
              从已有筛选器中获取
            </Radio>
            <Radio value={BOARD_FILTER_TYPE.CUSTOM}>
              自定义
            </Radio>
          </Radio.Group>
        )}
      </FormItem>

      {getFieldValue('type') === BOARD_FILTER_TYPE.FILTER &&
        <FormItem label='已有筛选器' {...formLayout}>
          {getFieldDecorator('filterId', {
            rules: [{ required: true, message: '此项必填' }]
          })(
            <Select style={{ width: '100%' }} placeholder='请选择'>
              {!kanbanList.find(x => x.type === BOARD_FILTER_TYPE.ALL) &&
                <Option key='all' value='all'>全部</Option>
              }
              {!kanbanList.find(x => x.type === BOARD_FILTER_TYPE.ALL_OPEN) &&
                <Option key='allOpen' value='allOpen'>全部打开的</Option>
              }
              {
                filterList && filterList.map(it => (
                  <Option key={it.id} value={it.id}>{it.name}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
      }

    </Modal>

    <Modal
      title='创建看板'
      width={1000}
      onCancel={() => setNextVisible(false)}
      destroyOnClose={checkList.length ? false : true}
      footer={<span>
        <Button onClick={() => { setNextVisible(false); setCheckList([]); resetFields() }}>取消</Button>
        <Button type='primary' onClick={() => { setNextVisible(false); setVisible(true) }}>上一步</Button>
        <Button type='primary' onClick={() => { handleOk(); setNextVisible(false); setCheckList([]) }}>
          确认({checkList && checkList.length})
        </Button>
      </span>}
      visible={nextVisible}
    >
      <RequireForm
        productid={props.productid}
        updateCheckList={updateCheckList}
        type='create'
      />
    </Modal>
  </span>;
}

export default Form.create()(Index);
