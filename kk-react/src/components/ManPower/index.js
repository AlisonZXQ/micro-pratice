import React, { useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Spin, message } from 'antd';
import { connect } from 'dva';
import { equalsObj } from '@utils/helper';
import { manPower, ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { NO_OPT_PERMISSION_TIP_MSG } from '@shared/ReceiptConfig';
import { PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import MyIcon from '@components/MyIcon';
import BusinessHOC from '@components/BusinessHOC';
import usePrevious from '@components/CustomHooks/usePrevious';

const FormItem = Form.Item;

const stateMap = {
  1: '',
  2: '（计算中...）',
  3: '（计算失败）',
  undefined: '-'
};

function ManPower(props) {

  const { type, id, formLayout, manPowerValue, getLoading, refreshLoading, dataSource, initObj, issueRole } = props;
  const editAccess = issueRole || ISSUE_ROLE_VALUE_MAP.MANAGE;

  const source = dataSource || PROJECT_DATASOURCE.EP;

  const initObjRef = usePrevious(initObj);

  useEffect(() => {
    if (type === 'project' || type === 'weekReport') {
      const params = {
        type: manPower[type],
        value: type === 'project' || type === 'weekReport' ? id : `${type}-${id}`,
      };
      if (id) {
        props.dispatch({ type: 'systemManage/getManPower', payload: params });
      }
    }
  }, [id, type]);

  useEffect(() => {
    if (!equalsObj(initObjRef, initObj)) {
      props.dispatch({ type: 'systemManage/saveManPower', payload: initObj });
    }
  }, [initObj, initObjRef]);

  const refreshManPower = () => {
    if (editAccess === ISSUE_ROLE_VALUE_MAP.READ) {
      return message.error(NO_OPT_PERMISSION_TIP_MSG);
    }
    const params = {
      type: manPower[type],
      value: type === 'project' || type === 'weekReport' ? id : `${type}-${id}`,
    };
    if (id) {
      props.dispatch({ type: 'systemManage/refreshManPower', payload: params });
    }
  };

  const getDay = (m) => {
    const time = m || 0;
    return <span className='f-ib'>
      {`${(time / (8 * 60 * 60)).toFixed(2)}人天`}
    </span>;
  };

  return (<span>
    {
      source !== PROJECT_DATASOURCE.EP && <></>
    }
    {
      source === PROJECT_DATASOURCE.EP &&
      <span>
        {
          type === 'project' ?
            <span>
              预估工作量/实际工作量：{getDay(manPowerValue.estimate)}/{getDay(manPowerValue.act)}
              {
                editAccess !== ISSUE_ROLE_VALUE_MAP.READ &&
                <MyIcon
                  type="icon-shuaxin"
                  className="f-fs3 u-mgl5"
                  style={{ position: 'relative', top: '1px' }}
                  onClick={() => refreshManPower()}
                />
              }

            </span>
            :
            <Spin spinning={getLoading || refreshLoading} size="small">
              <span>
                <FormItem label="预估工作量汇总" {...formLayout}>
                  {getDay(manPowerValue.estimate)}
                  <span>{stateMap[manPowerValue.state]}</span>
                </FormItem>
                <FormItem label="实际工作量汇总" {...formLayout}>
                  {getDay(manPowerValue.act)}
                  <span>{stateMap[manPowerValue.state]}</span>
                  {
                    editAccess !== ISSUE_ROLE_VALUE_MAP.READ &&
                    <MyIcon
                      type="icon-shuaxin"
                      className="f-fs3 u-mgl5"
                      onClick={() => refreshManPower()}
                      style={{ position: 'relative', top: '1px' }}
                    />
                  }
                </FormItem>
              </span>
            </Spin>
        }
      </span>
    }

  </span>);
}

const mapStateToProps = (state) => {
  return {
    manPowerValue: state.systemManage.manPower,
    getLoading: state.loading.effects['systemManage/getManPower'] || false,
    refreshLoading: state.loading.effects['systemManage/refreshManPower'] || false,
  };
};

export default BusinessHOC()(connect(mapStateToProps)(ManPower));
