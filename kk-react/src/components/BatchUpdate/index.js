import React, { useState } from 'react';
import { Dropdown, Menu, Button, DatePicker, Select, message } from 'antd';
import { LEVER_NAME, INCLUDE_PUBLISH, EXCLUDE_PUBLISH } from '@shared/ReceiptConfig';
import { levelMapArr } from '@shared/BugConfig';
import { handleSearchUser, handleSearchVersion } from '@shared/CommonFun';
import MyIcon from '@components/MyIcon';
import PopoverTip from '@components/PopoverTip';
import { batchUpdateIssue } from '@services/receipt';
import { getUpdateKeysArr, getIsSameSubProduct } from './BatchUpdateFun';
import styles from './index.less';
import moment from 'moment';

const { Option } = Select;

function Index(props) {
  const { data: conveyData, trigger, productId, refreshFun } = props;
  const data = conveyData || [];
  const [step, setStep] = useState('first');
  const [visible, setVisible] = useState(false);
  const [currentObj, setCurrentObj] = useState({});
  const [selectValue, setSelectValue] = useState();
  const [userList, setUserList] = useState([]);
  const [versionList, setVersionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const updateKeysArr = getUpdateKeysArr(data);
  const isSameSubProduct = getIsSameSubProduct(data);
  const subProductId = data[0] && data[0].subProductVO && data[0].subProductVO.id; // 相同子产品才会走到这一步

  const handleClose = () => {
    setVisible(false);
    setCurrentObj({});
  };

  /**
   * @description - 第一步 选择字段
   */
  const getFirstContent = () => {
    return (<div>
      <div className={styles.header}>
        <span></span>
        <span>批量编辑</span>
        <span onClick={() => handleClose()}>
          <MyIcon type="icon-guanbi1" className={styles.backCloseIcon} />
        </span>
      </div>
      <div className={styles.content}>
        {
          updateKeysArr.map(item =>
            <div
              className={item.disabled ? styles.disabledUpdateKey : styles.enableUpdateKey}
              onClick={() => {
                if (!item.disabled) {
                  setStep('second'); setCurrentObj(item);
                }
              }}
            >
              {item.name}
              {
                item.key === 'dueDate' &&
                <PopoverTip
                  trigger={<MyIcon type="icon-bangzhu" className="f-fs2 u-mgl5" />}
                  content="到期日/预计上线时间"
                />
              }
              {
                !isSameSubProduct && (item.key === 'fixVersionId' || item.key === 'findVersionId') &&
                <PopoverTip
                  trigger={<MyIcon type="icon-bangzhu" className="f-fs2 u-mgl5" />}
                  content="仅可选择同一个子产品下的数据"
                />
              }
            </div>)
        }
      </div>
    </div>);
  };

  /**
   * @description - 第二步 选择替换/清空
   */
  const getSecondContent = () => {
    return (<div>
      <div className={styles.header}>
        <span onClick={() => setStep('first')}>
          <MyIcon type="icon-fanhui" className={styles.backCloseIcon} />
        </span>
        <span>选择编辑方式</span>
        <span onClick={() => handleClose()}>
          <MyIcon type="icon-guanbi1" className={styles.backCloseIcon} />
        </span>
      </div>
      <div className={styles.content}>
        <div
          className={styles.divItem}
          onClick={() => setStep('third-replace')}
        >
          替换
        </div>
        {
          !currentObj.required &&
          <div
            className={styles.divItem}
            onClick={() => setStep('third-clear')}
          >
            完全清空
          </div>
        }
      </div>
    </div>);
  };

  /**
   * @description - 第三步 替换分为优先级/严重程度/日期/人名/版本
   */
  const getThirdReplaceContent = () => {
    const getHeader = () => {
      return (<div className={styles.header}>
        <span onClick={() => { setStep('second'); setSelectValue() }}>
          <MyIcon type="icon-fanhui" className={styles.backCloseIcon} />
        </span>
        <span>替换{currentObj.name}</span>
        <span onClick={() => handleClose()}>
          <MyIcon type="icon-guanbi1" className={styles.backCloseIcon} />
        </span>
      </div>);
    };

    const getButton = () => {
      return (<Button
        className={`${styles.commonWidth} u-mgt10`}
        type="primary"
        disabled={!selectValue}
        onClick={() => setStep('fourth')}
      >
        确定
      </Button>);
    };

    if (currentObj.key === 'level') {
      return (<div>
        {getHeader()}
        <div className={styles.content}>
          {
            Object.keys(LEVER_NAME).map(it =>
              <div
                className={styles.divItem}
                onClick={() => setSelectValue(Number(it))}
              >
                <span>{LEVER_NAME[Number(it)]}</span>
                {
                  Number(it) === selectValue &&
                  <MyIcon type="icon-xuanzhong1" className="u-mgr5" />
                }
              </div>)
          }
          {getButton()}
        </div>
      </div>);
    } else if (currentObj.key === 'bugLevel') {
      return (<div>
        {getHeader()}
        <div className={styles.content}>
          {
            levelMapArr.map(it =>
              <div
                className={styles.divItem}
                onClick={() => setSelectValue(it.value)}
              >
                <span>{it.label}</span>
                {
                  Number(it.value) === selectValue &&
                  <MyIcon type="icon-xuanzhong1" className="u-mgr5" />
                }
              </div>)
          }
          {getButton()}
        </div>
      </div>);
    } else if (currentObj.key === 'dueDate' || currentObj.key === 'expect' || currentObj.key === 'estimate') {
      return (<div>
        {getHeader()}
        <div className={styles.content}>
          <DatePicker
            className={`${styles.commonWidth} u-mgt10`}
            onChange={value => setSelectValue(moment(value).valueOf())}
            allowClear={false}
          />
          {getButton()}
        </div>
      </div>);
    } else if (currentObj.key === 'responseEmail' || currentObj.key === 'submitEmail' || currentObj.key === 'requireEmail') {
      return (<div>
        {getHeader()}
        <div className={styles.content}>
          <Select
            showSearch
            style={{ width: '180px', marginTop: '10px' }}
            placeholder="请输入人名搜索"
            optionFilterProp="children"
            filterOption={false}
            onSearch={(value) => handleSearchUser(value, (result) => {
              setUserList([...result]);
            })}
            onSelect={(value) => { setSelectValue(value) }}
            notFoundContent="暂无数据"
          >
            {
              userList && userList.length && userList.map(it => (
                <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
              ))
            }
          </Select>
          {getButton()}
        </div>
      </div>);
    } else if (currentObj.key === 'fixVersionId' || currentObj.key === 'findVersionId') {
      const versionState = currentObj.key === 'fixVersionId' ? EXCLUDE_PUBLISH : INCLUDE_PUBLISH;
      return (<div>
        {getHeader()}
        <div className={styles.content}>
          <Select
            showSearch
            style={{ width: '180px', marginTop: '10px' }}
            placeholder="输入名称搜索版本"
            filterOption={false}
            onSearch={(value) => handleSearchVersion(value, subProductId, versionState, (result) => {
              setVersionList(result);
            })}
            onSelect={(value) => { setSelectValue(value) }}
            notFoundContent={'暂无数据'}
          >
            {
              versionList && versionList.map(item => (
                <Option key={item.version.id} value={item.version.id} data={item}>
                  <span>{item.version.name}</span>
                </Option>
              ))
            }
          </Select>
          {getButton()}
        </div>
      </div>);
    }
  };

  /**
   * @description - 第三步 清空
   */
  const getThirdClearContent = () => {
    return (
      <div>
        <div className={styles.header}>
          <span onClick={() => setStep('second')}>
            <MyIcon type="icon-fanhui" className={styles.backCloseIcon} />
          </span>
          <span>批量清空</span>
          <span onClick={() => handleClose()}>
            <MyIcon type="icon-guanbi1" className={styles.backCloseIcon} />
          </span>
        </div>
        <div className={styles.content}>
          <span className="u-mgt10 f-ib">
            确定批量<a className="delColor u-mgl10 u-mgr10">清空</a>
            所选的<a className="delColor u-mgl10 u-mgr10">{data.length}</a>
            条工作项该字段值？
          </span>
        </div>
        <Button
          className={`${styles.commonWidth} u-mgt10 u-mgl10`}
          type="danger"
          onClick={() => handleClear()}
          loading={loading}
        >
          清空
        </Button>
      </div>
    );
  };

  /**
   * @description - 第四步 替换确认
   */
  const getFourthContent = () => {
    return (<div>
      <div className={styles.header}>
        <span onClick={() => setStep('third-replace')}>
          <MyIcon type="icon-fanhui" className={styles.backCloseIcon} />
        </span>
        <span>批量编辑</span>
        <span onClick={() => handleClose()}>
          <MyIcon type="icon-guanbi1" className={styles.backCloseIcon} />
        </span>
      </div>
      <div className={styles.content}>
        <span className="u-mgt10 f-ib">
          确定批量<a className="u-primary u-mgl10 u-mgr10">替换</a>
          所选的<a className="u-primary u-mgl10 u-mgr10">{data.length}</a>
          条工作项的 {currentObj.name}？
        </span>
      </div>
      <Button
        className={`${styles.commonWidth} u-mgt10 u-mgl10`}
        type="primary"
        onClick={() => handleReplace()}
        loading={loading}
      >
        确定
      </Button>
    </div>);
  };

  const getUpdateKey = () => {
    let key = currentObj.key;
    if (currentObj.key === 'bugLevel') {
      key = 'level';
    } else if (['dueDate', 'expect', 'estimate'].includes(currentObj.key)) {
      key = 'expectReleaseTimeMill';
    }
    return key;
  };

  /**
   * @description - 替换
   */
  const handleReplace = () => {
    let params = {
      key: getUpdateKey(),
      productId: productId,
      value: selectValue,
      issueKeyList: data.map(it => it.issueKey),
    };
    setLoading(true);
    batchUpdateIssueFun(params);
  };

  /**
   * 清空
   */
  const handleClear = () => {
    let params = {
      key: getUpdateKey(),
      productId: productId,
      value: '',
      issueKeyList: data.map(it => it.issueKey),
    };
    setLoading(true);
    batchUpdateIssueFun(params);
  };

  const batchUpdateIssueFun = (params) => {
    batchUpdateIssue(params).then(res => {
      setLoading(false);
      if (res.code !== 200) return message.error(res.msg);
      message.success('批量更新成功！');
      setVisible(false);
      if (refreshFun && typeof refreshFun === 'function') {
        refreshFun();
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const menu = () => {
    return <Menu className={styles.menu}>
      {
        step === 'first' && getFirstContent()
      }
      {
        step === 'second' && getSecondContent()
      }
      {
        step === 'third-replace' && getThirdReplaceContent()
      }
      {
        step === 'third-clear' && getThirdClearContent()
      }
      {
        step === 'fourth' && getFourthContent()
      }
    </Menu>;
  };

  return (<span className={styles.container}>
    <Dropdown
      trigger={['click']}
      overlay={menu}
      visible={visible}
      onVisibleChange={visible => setVisible(visible)}
      placement="topLeft"
    >
      <span>
        {
          trigger
            ? trigger
            :
            <a onClick={() => setStep('first')}>批量编辑</a>
        }
      </span>
    </Dropdown>
  </span>);
}

export default Index;
