import React, { useEffect, useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, message, Button, Row, Col, Input, Empty, Spin, Divider } from 'antd';
import { getConfigList, addConfigDis, emptyConfigDis, deleteConfigDis, updateConfigDis } from '@services/product_setting';
import { warnModal, handleSearchUser } from '@shared/CommonFun';
import BackToPreview from '@components/BackToPreview';
import EditTitle from '@components/EditTitle';
import { updateDismantle } from '@services/product_setting';
import { deepCopy } from '@utils/helper';
import styles from './index.less';

const Option = Select.Option;

function CreatePlanConfig(props) {
  const { currentPlan, setCurrentDisplay } = props;
  const [configList, setConfigList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alldone, setAlldone] = useState(true);
  const currentPlanId = currentPlan.id;

  const handleClearConfig = () => {
    warnModal({
      title: `您确认清空当前拆分方案吗?`,
      okCallback: () => {
        emptyConfig();
      }
    });
  };

  useEffect(() => {
    if (currentPlan.id) {
      getPlan(currentPlan.id);
    }
  }, [currentPlan.id]);

  const getPlan = (value) => {
    setLoading(true);
    setConfigList([]);
    const emptyList = [{
      name: '',
      responseEmail: '',
      requireEmail: '',
      verifyEmail: '',
      isEdit: true,
    }];
    getConfigList({ dismantleid: value }).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取拆分配置失败, ${res.msg}`);
      }
      setLoading(false);
      if (res.result.length === 0) {
        setConfigList(emptyList);
        setAlldone(false);
      } else {
        let data = [];
        res.result.map((item) => {
          data.push({
            id: item.productDismantleConfig.id || 0,
            name: item.productDismantleConfig.name || '',
            responseEmail: item.responseUser.email || '',
            requireEmail: item.requireUser.email || '',
            verifyEmail: item.verifyUser.email || '',
          });
        });
        setConfigList(data);
      }
    }).catch((err) => {
      return message.error('获取拆分配置异常', err || err.msg);
    });
  };

  const addConfigData = () => {
    if (!alldone) {
      return message.error('请先完成当前配置后再操作');
    }
    if (currentPlanId === 0) {
      return message.warning('请先选择方案！');
    }
    const data = configList;
    data.push({
      name: '',
      responseEmail: '',
      requireEmail: '',
      verifyEmail: '',
      isEdit: true,
    });

    setConfigList(data);
    setAlldone(false);
  };

  const deleteConfigData = (index, item) => {
    const data = deepCopy(configList, []);
    if (item.id) {
      const params = {
        id: item.id
      };
      deleteConfigDis(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`删除配置失败, ${res.msg}`);
        }
        getPlan(currentPlanId);
        message.success('删除成功');
      }).catch((err) => {
        return message.error('删除配置异常', err || err.msg);
      });
    } else {
      data.splice(index, 1);
      setConfigList(data);
    }
  };

  const handleChangeState = (index, state, item) => {
    let data = [...configList];
    if (state === 'isEdit') {
      data[index].isEdit = true;
      setConfigList(data);
    } else if (state === 'noEdit') {
      if (item.id) {
        data[index].isEdit = false;
        setConfigList(data);
      } else {
        deleteConfigData(index, item);
      }
    }
  };

  const setLabel = (index, value, type) => {
    configList.map((item, idx) => {
      if (index === idx) {
        item[type] = value;
      }
    });
    setConfigList([...configList]);
  };

  const saveConfigItem = (index) => {
    const item = configList[index];
    if (!item.name || !item.responseEmail || !item.requireEmail || !item.verifyEmail) {
      return message.warning('请将当前信息填写完整');
    }
    if (item.id) { //编辑
      const params = {
        id: item.id,
        ...item,
      };
      delete params.isEdit;
      updateConfigDis(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`修改配置失败, ${res.msg}`);
        }
        getPlan(currentPlanId);
        setAlldone(true);
        return message.success('修改成功');
      }).catch((err) => {
        return message.error('修改配置异常', err || err.msg);
      });
    } else { //保存
      const params = {
        dismantleId: currentPlanId,
        ...item,
      };
      delete params.isEdit;
      addConfigDis(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`添加配置失败, ${res.msg}`);
        }
        getPlan(currentPlanId);
        setAlldone(true);
        return message.success('添加成功');
      }).catch((err) => {
        return message.error('添加配置异常', err || err.msg);
      });
    }
  };

  const emptyConfig = () => {
    const params = {
      dismantleid: currentPlanId,
    };
    emptyConfigDis(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`清空配置失败, ${res.msg}`);
      }
      setConfigList([]);
      return message.success('已清空');
    }).catch((err) => {
      return message.error('清空配置异常', err || err.msg);
    });
  };

  const setEditState = (index) => {
    if (!alldone) {
      return message.error('请先完成当前配置后再操作');
    }
    handleChangeState(index, 'isEdit');
    setAlldone(false);
  };

  const updateName = (name) => {
    const params = {
      id: currentPlanId,
      name
    };
    updateDismantle(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`更新失败, ${res.msg}`);
      }
      message.success('更新成功');
    }).catch((err) => {
      return message.error('更新异常', err || err.msg);
    });
  };

  return (<Spin spinning={loading}>
    <div style={{ padding: '0px 16px 16px 16px' }}>
      <div className='bbTitle'>
        <span className='name'>拆单配置列表</span>
      </div>
      <div className='bgWhiteModel' style={{ padding: '16px' }}>
        {/* <div>
          <span>拆单配置：</span>
          <Select
            placeholder="请选择方案"
            style={{ width: '200px' }}
            onChange={(value) => handleSelectChange(value)}
          >
            {planList && planList.map((item) => (
              <Option value={item.id}>{item.name}</Option>
            ))}
          </Select>
          <span className='u-mg20'>
            没找到？
            <PlanForm
              trigger={<a>创建一个新方案</a>}
              type="create"
              getPlanList={getPlanList}
            />
          </span>
        </div> */}
        <div>
          <div className="u-mgb10">
            <BackToPreview title="返回" callback={() => setCurrentDisplay('list')} />
          </div>
          <div>
            <EditTitle
              title={currentPlan.name}
              handleSave={(value) => updateName(value)}
              maxWidth={'45vw'}
            />
          </div>
        </div>
        <div className='u-mgt10'>
          <Row className={styles.svTitle}>
            <Col span={5} style={{ padding: '12px 40px 12px' }}>名称</Col>
            <Col span={5} style={{ padding: '12px 40px 12px' }}>负责人</Col>
            <Col span={5} style={{ padding: '12px 40px 12px' }}>报告人</Col>
            <Col span={5} style={{ padding: '12px 40px 12px' }}>验证人</Col>
            <Col span={4} style={{ padding: '12px 40px 12px' }}>操作</Col>
          </Row>
          {configList && configList.map((item, index) => (
            item.isEdit ? <Row className='f-aic' style={{ height: '46px', display: 'flex' }}>
              <Col span={5} className='u-pdl40'>
                <Input
                  onChange={(e) => setLabel(index, e.target.value, 'name')}
                  value={item.name}
                  style={{ width: '200px' }}
                  placeholder='名称' />
              </Col>
              <Col span={5} className='u-pdl40'>
                <Select
                  onChange={(value) => setLabel(index, value, 'responseEmail')}
                  showArrow={false}
                  showSearch
                  style={{ width: '200px' }}
                  placeholder="负责人"
                  onSearch={(responseValue) => handleSearchUser(responseValue, (result) => {
                    setUserList(result);
                  })}
                  defaultValue={item.responseEmail}
                >
                  {
                    userList && userList.length && userList.map(it => (
                      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              </Col>
              <Col span={5} className='u-pdl40'>
                <Select
                  onChange={(value) => setLabel(index, value, 'requireEmail')}
                  showArrow={false}
                  showSearch
                  style={{ width: '200px' }}
                  placeholder="验证人"
                  onSearch={(value) => handleSearchUser(value, (result) => {
                    setUserList(result);
                  })}
                  defaultValue={item.requireEmail}
                >
                  {
                    userList && userList.length && userList.map(it => (
                      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              </Col>
              <Col span={5} className='u-pdl40'>
                <Select
                  onChange={(value) => setLabel(index, value, 'verifyEmail')}
                  showArrow={false}
                  showSearch
                  style={{ width: '200px' }}
                  placeholder="负责人"
                  onSearch={(verifyValue) => handleSearchUser(verifyValue, (result) => {
                    setUserList(result);
                  })}
                  defaultValue={item.verifyEmail}
                >
                  {
                    userList && userList.length && userList.map(it => (
                      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              </Col>
              <Col span={4} className='u-pdl40'>
                <a onClick={() => saveConfigItem(index)}>保存</a>
                <Divider type="vertical" />
                <a onClick={() => { handleChangeState(index, 'noEdit', item); setAlldone(true) }}>取消</a>
              </Col>
            </Row> :
              <Row className='f-aic' style={{ height: '46px', display: 'flex' }}>
                <Col span={5} className='f-toe u-pdl40'>{item.name}</Col>
                <Col span={5} className='f-toe u-pdl40'>{item.responseEmail}</Col>
                <Col span={5} className='f-toe u-pdl40'>{item.requireEmail}</Col>
                <Col span={5} className='f-toe u-pdl40'>{item.verifyEmail}</Col>
                <Col span={4} className='u-pdl40'>
                  <a onClick={() => { setEditState(index) }}>编辑</a>
                  <Divider type="vertical" />
                  <a className='delColor' onClick={() => deleteConfigData(index, item)}>删除</a>
                </Col>
              </Row>
          ))}
          {configList.length === 0 &&
            <div className='u-pd20'>
              <Empty />
            </div>}
          <span>
            <Button
              className='u-mgt20 u-mgr10'
              onClick={() => addConfigData()}>
              添加行
            </Button>
            <a className='u-mgl10' onClick={() => handleClearConfig()}>清空</a>
          </span>
        </div>
      </div>
    </div>
  </Spin>);

}


export default Form.create()(CreatePlanConfig);
