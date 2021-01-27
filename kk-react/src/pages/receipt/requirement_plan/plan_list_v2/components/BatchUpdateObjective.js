import React, { useState } from 'react';
import { Dropdown, Menu, Button, message, Input } from 'antd';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import { connTypeMap } from '@shared/ReceiptConfig';
import { issueRelationAdd } from '@services/receipt';
import styles from '../index.less';

const { Search } = Input;

function BatchUpdateObjective({ planList, data, callback }) {
  const [visible, setVisible] = useState(false);
  const [selectValue, setSelectValue] = useState();
  const [step, setStep] = useState('first');
  const [searchValue, setSearchValue] = useState('');

  const handleClose = () => {
    setVisible(false);
  };

  const menu = () => {
    return <Menu className={styles.menu}>
      {
        step === 'first' && getFirstContent()
      }
      {
        step === 'second' && getSecondContent()
      }
    </Menu>;
  };

  const processData = () => {
    return planList.filter(it => it.name && it.name.includes(searchValue));
  };

  const getFirstContent = () => {
    return (<div>
      <div className={styles.header}>
        <span></span>
        <span>关联目标</span>
        <span onClick={() => handleClose()}>
          <MyIcon type="icon-guanbi1" className={styles.backCloseIcon} />
        </span>
      </div>
      <div className={styles.search}>
        <Search
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
        />
      </div>
      <div className={styles.content}>
        {
          processData().map(it =>
            <div
              className={styles.divItem}
              onClick={() => setSelectValue(it.id)}
            >
              <TextOverFlow content={it.name} maxWidth={'260px'} />
              {
                it.id === selectValue &&
                <MyIcon type="icon-xuanzhong1" className="u-mgr5" />
              }
            </div>)
        }
      </div>
      <Button
        className={`${styles.commonWidth} u-mgt10 u-mgl10`}
        type="primary"
        disabled={!selectValue}
        onClick={() => setStep('second')}
      >
        确定
      </Button>
    </div>);
  };

  const getSecondContent = () => {
    return (<div>
      <div className={styles.header}>
        <span onClick={() => setStep('first')}>
          <MyIcon type="icon-fanhui" className={styles.backCloseIcon} />
        </span>
        <span>批量编辑</span>
        <span onClick={() => handleClose()}>
          <MyIcon type="icon-guanbi1" className={styles.backCloseIcon} />
        </span>
      </div>
      <div className={styles.content}>
        <span className="u-mgt10 f-ib">
          确定批量<a className="delColor u-mgl10 u-mgr10">添加</a>
          所选的<a className="delColor u-mgl10 u-mgr10">{data.length}</a>
          条工作项该字段值？
        </span>
      </div>
      <Button
        className={`${styles.commonWidth} u-mgt10 u-mgl10`}
        type="primary"
        onClick={() => handleOk()}
      >
        确定
      </Button>
    </div>);
  };

  const handleOk = () => {
    const params = {
      parentIssueId: selectValue,
      issueIdList: data.map(it => it.id),
      issueType: connTypeMap.requirement,
      parentIssueType: connTypeMap.objective,
    };
    issueRelationAdd(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('已成功添加');
      setVisible(false);
      callback();
      setSelectValue();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  return <span>
    <Dropdown
      trigger={['click']}
      overlay={menu}
      visible={visible}
      overlayStyle={{ zIndex: 999 }}
      onVisibleChange={visible => setVisible(visible)}
    >
      <span>
        <a onClick={() => {
          setSearchValue('');
          setSelectValue();
          setStep('first');
        }}>关联目标</a>
      </span>
    </Dropdown>
  </span>;
}

export default BatchUpdateObjective;
