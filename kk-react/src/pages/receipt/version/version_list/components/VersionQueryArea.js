import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Dropdown, Card, Select, Button } from 'antd';
import { getFormLayout } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formLayout = getFormLayout(6, 16);
const stateMapArr = [
  {key: 1, value: '新建'},
  {key: 2, value: '已开启'},
  {key: 3, value: '已发布'},
];

const VersionQueryArea = ({ resetVersion, updateVersion, subProductAll, form }) => {
  const [visible, setVisible] = useState(false);
  const { getFieldDecorator, resetFields } = form;

  const handleOk = () => {
    form.validateFieldsAndScroll(['nameVersionQuery', 'subProductIdList', 'state'], (err, values) => {
      if(err) {
        return;
      }
      const params = {
        ...values,
        name: values.nameVersionQuery
      };
      delete params.nameVersionQuery;
      updateVersion(params);
    });
  };

  const handleReset = () => {
    resetFields();
    resetVersion();
  };

  const menu = () => {
    return (<Card style={{ width: '300px' }}>
      <div className='u-pdt10'>
        <FormItem label="名称" {...formLayout}>
          {getFieldDecorator('nameVersionQuery', {
          })(
            <Input placeholder='请输入' maxLength={100} style={{ width: '200px' }} />
          )}
        </FormItem>
        <FormItem label="子产品" {...formLayout}>
          {getFieldDecorator('subProductIdList', {
          })(
            <Select
              mode='multiple'
              placeholder='请选择'
              style={{ width: '200px' }}>
              {subProductAll && subProductAll.map(it => (
                <Option key={it.id} value={it.id}>
                  {it.subProductName}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label="状态" {...formLayout}>
          {getFieldDecorator('state', {
            initialValue: [VERISON_STATUS_MAP.NEW, VERISON_STATUS_MAP.OPEN]
          })(
            <Select
              mode='multiple'
              placeholder='请选择'
              style={{ width: '200px' }}>
              {stateMapArr && stateMapArr.map(it => (
                <Option key={it.key} value={it.key}>
                  {it.value}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
      </div>
      <div className='f-tar u-mgr20'>
        <Button className='u-mgr10' onClick={() => handleReset()}>重置</Button>
        <Button type='primary' onClick={() => handleOk()}>筛选</Button>
      </div>
    </Card>);
  };

  return (
    <span className={`${styles.versionQuery} f-jcsb`}>
      <span className={styles.left}>版本</span>
      <span className={styles.right}>
        <span className={styles.text}>更多筛选</span>
        <Dropdown
          visible={visible}
          onVisibleChange={(visible) => setVisible(visible)}
          trigger={['click']}
          overlay={menu()}>
          <MyIcon
            type='icon-gengduoguolv'
            className={styles.icon} />
        </Dropdown>
      </span>
    </span>
  );
};

export default VersionQueryArea;
