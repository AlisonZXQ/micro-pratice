import React, { useCallback, useEffect, useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Radio, message, Empty, Spin, Popconfirm } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import Modal from '@components/CustomAntd/modal';
import YearPicker from '@components/YearPicker';
import MyIcon from '@components/MyIcon';
import { OKR_OBJECTIVE_IMPORT_FLAG, OKR_OBJECTIVE_TYPE } from '@shared/ObjectiveConfig';
import { getOKRList } from '@services/objective';
import { getSystemDescription, getIssueCustom } from '@utils/helper';
import { createBill } from '@services/receipt';
import { handleShowPersonConfirm } from '@shared/CommonFun';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import CreateObjective from './components/CreateObjective';
import { getGroupData } from './components/OKRObjectiveFun';
import styles from './index.less';

const RadioGroup = Radio.Group;

/**
 *
 * @param {boolean} isNotChange - 是否添加单据相关人员到项目中
 */
function Index({
  trigger, productId,
  form, customList,
  customSelect, refreshFun,
  projectId, isNotChange,
  form: { getFieldsValue }, projectMember,
  dispatch
}) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState('');
  const [selectObj, setSelectObj] = useState({});
  const [groupCollase, setGroupCollase] = useState({});
  const [loading, setLoading] = useState(false);
  const [objectiveList, setObjectiveList] = useState([]);
  const [year, setYear] = useState();
  const [step, setStep] = useState('first');

  const getOKRListFun = useCallback(() => {
    const params = {
      type: current === 'person' ? OKR_OBJECTIVE_TYPE.PERSON : OKR_OBJECTIVE_TYPE.GROUP,
      year,
    };
    getOKRList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        setObjectiveList(res.result);
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, [current, year]);

  useEffect(() => {
    if (current && year) {
      getOKRListFun();
    }

  }, [current, year, getOKRListFun]);

  const handleNext = () => {
    setStep('second');
  };

  const handlePrevious = () => {
    setStep('first');
    form.resetFields();
  };

  const getObjectiveItem = (it) => {
    // flag true已导入
    const flag = it.existState === OKR_OBJECTIVE_IMPORT_FLAG.HAS_IMPORT;
    return (<div
      className={flag ? styles.rowDisabled : selectObj.id === it.id ? styles.rowActive : styles.row}
      onClick={() => {
        if (!flag) {
          setSelectObj(it);
        }
      }}
    >
      <div className={styles.radio}>
        <Radio checked={selectObj.id === it.id} disabled={flag}></Radio>
      </div>
      <div className={styles.name}>{it.cycleYear}年{it.cycleName}目标</div>
      <div className={styles.description}>{it.name}</div>
      {
        flag && <div className={styles.tag}>已导入</div>
      }
    </div>);
  };

  const getPersonContent = () => {
    return objectiveList.length ?
      <Spin spinning={loading}>
        {objectiveList.map(item =>
          getObjectiveItem(item))}
      </Spin>
      :
      <Empty />;
  };

  const getGroupContent = () => {
    const groupData = getGroupData(objectiveList);

    return groupData.length ?
      <Spin spinning={loading}>
        {
          groupData.map(item => <div>
            <div className={styles.groupHeader}>
              <span
                className={styles.title}
                onClick={() => setGroupCollase({
                  ...groupCollase,
                  [item.id]: !groupCollase[item.id]
                })}
              >
                <span className={styles.name}>
                  {item.deptName}
                </span>
                <span>
                  <MyIcon
                    type="icon-fanhui"
                    className={groupCollase[item.id] ? styles.iconCollapse : styles.iconExpand}
                  />
                </span>
              </span>
            </div>
            {
              !groupCollase[item.id] && item.children.map(it => getObjectiveItem(it))
            }
          </div>)
        }
      </Spin>
      :
      <Empty />;
  };

  /**
   * 滚动定位
   */
  useEffect(() => {
    if (document.getElementById('objectiveContainer')) {
      document.getElementById('objectiveContainer').scrollTop = 0;
    }
  }, [current]);

  const getFirstStep = () => {
    return (<div className={styles.body}>
      <div className={styles.header}>
        <RadioGroup onChange={e => setCurrent(e.target.value)} value={current} >
          <Radio key="person" value="person">个人目标</Radio>
          <Radio key="group" value="group">组织目标</Radio>
        </RadioGroup>
      </div>

      <div className={styles.content}>
        <div className={styles.date}>
          <span>目标周期：</span>
          <YearPicker
            children={<a>选择日期</a>}
            onChange={(value) => { setYear(moment(value).format('YYYY')) }}
            allowClear={false}
            defaultValue={moment()}
          />
        </div>
        <div className={styles.objectiveContainer} id="objectiveContainer">
          {
            current === 'person' && getPersonContent()
          }
          {
            current === 'group' && getGroupContent()
          }
        </div>
      </div>
    </div>);
  };

  const getSecondStep = () => {
    return <div id="createObjective">
      <CreateObjective
        productId={productId}
        form={form}
        defaultValueObj={{
          name: selectObj.name,
          responseemail: selectObj.responseEmail,
          description: selectObj.description,
          [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: selectObj.remark,
          expect_releasetime: selectObj.expectReleaseTime ? moment(selectObj.expectReleaseTime) : undefined,
        }}
      />
    </div>;
  };

  const handleOk = (issueRole2ProjectMember) => {
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段
      const params = {
        okrId: selectObj.id,
        projectId: projectId || 0,
        parentid: 0,
        issuetype: ISSUE_TYPE_JIRA_MAP.OBJECTIVE,
        ...values,
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        issueRole2ProjectMember,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };
      setLoading(true);
      createBill(params).then((res) => {
        setLoading(false);
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        handleCancel();
        setCurrent('');
        dispatch({ type: 'project/getProjectMember', payload: { id: projectId } });
        if (refreshFun && typeof refreshFun === 'function') {
          refreshFun();
        }
      }).catch((err) => {
        setLoading(false);
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  };

  const getFooter = () => {

    if (step === 'first') {
      return <span className="u-mgr10">
        <Button onClick={() => handleCancel()}>取消</Button>
        <Button type="primary" disabled={!selectObj.id} onClick={() => handleNext()}>下一步</Button>
      </span>;
    } else {
      return <span>
        <Button onClick={() => handleCancel()}>取消</Button>
        <Button onClick={() => handlePrevious()}>上一步</Button>
        {
          isNotChange && handleShowPersonConfirm(getFieldsValue(), projectMember) ?
            <Popconfirm
              title="是否将单据相关人员加入到项目中?"
              onConfirm={() => handleOk(true)}
              onCancel={() => handleOk(false)}
              okText="是"
              cancelText="否"
            >
              <Button type="primary">确定</Button>
            </Popconfirm>
            :
            <Button type="primary" onClick={() => handleOk(false)} loading={loading}>确定</Button>
        }
      </span>;
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setSelectObj({});
    setStep('first');
    form.resetFields({});
  };

  const getTitle = () => {
    return <span>
      导入OKR目标
      <MyIcon
        type="icon-shuaxin"
        className="u-mgl10"
        onClick={() => {
          setCurrent('person');
          setStep('first');
          setSelectObj({});
          form.resetFields();
        }}
      />
    </span>;
  };

  return (<span>
    <span
      onClick={() => {
        setVisible(true);
        setCurrent('person');
        setYear(moment().format('YYYY'));
      }}
    >{trigger}
    </span>
    <Modal
      title={getTitle()}
      visible={visible}
      footer={getFooter()}
      onOk={() => handleOk()}
      onCancel={() => handleCancel()}
      className={step === 'second' ? "modal-createissue-height" : ''}
      width={step === 'first' ? 650 : 1000}
      destroyOnClose
    >
      {step === 'first' && getFirstStep()}
      {step === 'second' && getSecondStep()}
    </Modal>
  </span>);
}

const mapStateToProps = (state) => {
  return {
    customList: state.receipt.customList,
    customSelect: state.aimEP.customSelect,
    projectMember: state.project.projectMember,
  };
};
export default connect(mapStateToProps)(Form.create()(Index));
