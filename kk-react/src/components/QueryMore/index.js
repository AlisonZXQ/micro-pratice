import React, { Component } from 'react';
import { CloseCircleFilled } from '@ant-design/icons';
import { Menu, Dropdown, Checkbox, Input, message, Cascader, InputNumber, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import MyIcon from '@components/MyIcon';
import { equalsObj } from '@utils/helper';
import { getCustomadvise } from '@services/advise';
import { getAllTagList, getProductVersionList } from '@services/product_setting';
import StyleDatePicker from '@components/CustomAntd/StyleDatePicker';
import { levelMap, resolveResultConditionMap } from '@shared/AdviseConfig';
import { onlinebugMap, classifyBug } from '@shared/BugConfig';
import { epicType } from '@shared/ObjectiveConfig';
import { CUSTOME_TYPE_MAP } from '@shared/ReceiptConfig';
import FilterSelectIssue from '@components/FilterSelectIssue';
import PersonFilterSelect from '@components/PersonFilterSelect';
import { handleSearchUser } from '@shared/CommonFun';

import styles from './index.less';

class QueryMore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectArr: [],
      inputVal: '',
      visible: false,
      addQueryList: [],
      dataSource: [],
      userList: [], //成员选择数据
    };
    this.textInput = React.createRef();
  }

  componentDidMount() {
    const pid = this.props.productid;
    const qcl_advise = localStorage.getItem(`qcl_${this.props.type}`) && JSON.parse(localStorage.getItem(`qcl_${this.props.type}`));
    const qcl_advise_session = sessionStorage.getItem(`qcl_${this.props.type}_${pid}`) && JSON.parse(sessionStorage.getItem(`qcl_${this.props.type}_${pid}`));

    if (qcl_advise_session) {
      this.setState({ selectArr: this.props.isNotList ? [] : qcl_advise_session });
      this.getDefaultSelectData(this.props.parentParams);
    } else if (qcl_advise) {
      this.setState({ selectArr: this.props.isNotList ? [] : qcl_advise });
      this.getDefaultSelectData(this.props.parentParams);
    }

    const { dataSource, isNotList } = this.props;
    if (dataSource && dataSource.length && !isNotList) {
      if (qcl_advise_session) {
        this.updateQueryList(qcl_advise_session, dataSource);
      } else {
        this.updateQueryList(qcl_advise, dataSource);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const pid = this.props.productid;
    const qcl_advise_session = sessionStorage.getItem(`qcl_${this.props.type}_${pid}`) && JSON.parse(sessionStorage.getItem(`qcl_${this.props.type}_${pid}`));
    const qcl_advise = localStorage.getItem(`qcl_${this.props.type}`) && JSON.parse(localStorage.getItem(`qcl_${this.props.type}`));
    if (qcl_advise_session && !this.props.isNotList) {
      this.setState({ selectArr: qcl_advise_session });
    } else if (qcl_advise && !this.props.isNotList) {
      this.setState({ selectArr: qcl_advise });
    } else if (!this.props.isNotList) {
      this.setState({ selectArr: [] });
    }

    if (!equalsObj(this.props.dataSource, nextProps.dataSource)) {
      this.setState({ dataSource: nextProps.dataSource });
      if (!this.props.isNotList) {
        if (qcl_advise_session) {
          this.updateQueryList(qcl_advise_session, nextProps.dataSource);
        } else {
          this.updateQueryList(qcl_advise, nextProps.dataSource);
        }
      }
    }

    if (!equalsObj(nextProps.parentParams, this.props.parentParams)) {
      if (nextProps.parentParams.customfield === undefined && !this.props.isNotList) { //点击重置时清空state
        this.clearState();
      }
      this.setState({ parentParams: nextProps.parentParams }, () => {
        this.getDefaultSelectData(nextProps.parentParams);
        if (!this.props.isNotList) {
          if (qcl_advise_session) {
            this.updateQueryList(qcl_advise_session, nextProps.dataSource);
          } else {
            this.updateQueryList(qcl_advise, nextProps.dataSource);
          }
        }
      });
    }
  }

  clearState = () => {
    for (let i in this.state) {
      if (i.indexOf('customfield') > -1) {
        this.setState({ [i]: '' });
      }
    }
  }

  onVisibleChange = (visible) => this.setState({ visible });

  updateSelectArr = (value) => {
    const pid = this.props.productid;
    this.setState({ [value]: '' }); //初始化
    const { selectArr } = this.state;
    let arr = [];
    if (selectArr.includes(value)) {
      arr = selectArr.filter(item => item !== value);
    } else {
      arr = [...selectArr, value];
    }
    this.props.changeQueryMore(arr);
    this.setState({ selectArr: arr });
    localStorage.setItem(`qcl_${this.props.type}`, arr && JSON.stringify(arr));
    sessionStorage.setItem(`qcl_${this.props.type}_${pid}`, arr && JSON.stringify(arr));

    this.updateQueryList(arr);
  }

  updateQueryList = (arr, data) => {
    const dataSource = data || this.props.dataSource;
    const localArr = arr || [];

    let newArr = [];
    for (var i = 0; i < dataSource.length; i++) {
      for (var j = 0; j < localArr.length; j++) {
        if (dataSource[i].key === localArr[j]) {
          newArr.push(dataSource[i]);
        }
      }
    }

    this.setState({ addQueryList: newArr });
  }

  deleteQuery = (e, key, status) => {
    const pid = this.props.productid;
    const { addQueryList } = this.state;
    let arr = addQueryList;
    addQueryList.map((it, index) => {
      if (it.key === key) {
        arr.splice(index, 1);
      }
    });
    let newSelectArr = [];
    arr.forEach((item, index) => {
      newSelectArr.push(item.key);
    });
    this.setState({ addQueryList: arr });
    localStorage.setItem(`qcl_${this.props.type}`, newSelectArr && JSON.stringify(newSelectArr));
    sessionStorage.setItem(`qcl_${this.props.type}_${pid}`, newSelectArr && JSON.stringify(newSelectArr));
    this.setState({ selectArr: newSelectArr });

    this.props.updateFilter(key, '', status);
  }

  clearAll() {
    this.setState({ addQueryList: [] });
    this.setState({ selectArr: [] });
    localStorage.removeItem(`qcl_${this.props.type}`);
    localStorage.removeItem(`${this.props.type}ListQuery`);
  }

  getDefaultSelectData = (params) => {
    setTimeout(() => {
      const { dataSource } = this.state;
      for (let i in params) {
        if (params[i]) {
          if (i === 'customfield') {
            const customArr = params[i] ? JSON.parse(params[i]) : [];
            customArr.forEach(it => {
              let item = dataSource.find(i => i.key === `customfield_${it.customfieldid}`);
              let isSelect = [CUSTOME_TYPE_MAP.SELECT, CUSTOME_TYPE_MAP.MULTISELECT, CUSTOME_TYPE_MAP.CASCADER].indexOf(item && item.status) > -1;
              this.getSelectData(`customfield_${it.customfieldid}`, it.values, isSelect ? 'select' : 'default');
            });
          } else {
            this.getSelectData(i, '', 'default');
          }
        }
      }
    }, 100);
  }

  // 获取更多下-下拉筛选条件的数据
  getSelectData = (key, values, type) => {
    if (key === 'fixversionid' || key === 'findversionid') {

      const productid = (this.state.parentParams && this.state.parentParams.productid) || this.props.productid;
      getProductVersionList().then((res) => { //获取任务版本
        if (res.code !== 200) { return message.error(res.msg) }
        const newList = res.result && res.result.filter((it) => it.productid === Number(productid));
        console.log(newList)
        this.setState({ [`${key}-list`]: newList });
      }).catch((err) => {
        return message.error(err || err.message);
      });

    } else if (key === 'onlinebug') {

      this.setState({ [`${key}-list`]: onlinebugMap });
    } else if (key === 'bugtype') {

      this.setState({ [`${key}-list`]: classifyBug });
    } else if (key === 'type') { //目标类型

      this.setState({ [`${key}-list`]: epicType });
    } else if (key === 'level') {
      this.setState({ [`${key}-list`]: levelMap });

    } else if (key === 'resolveresult') {
      this.setState({ [`${key}-list`]: resolveResultConditionMap });
    } else if (key === 'tag') {
      const productid = (this.state.parentParams && this.state.parentParams.productid) || this.props.productid;
      const params = {
        productid,
      };
      getAllTagList(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`${res.msg}`);
        }
        const data = [];
        res.result && res.result.map((item) => {
          data.push({
            id: item.id,
            name: item.name,
          });
        });
        this.setState({ [`${key}-list`]: data });

        let ListQuery = {};
        try {
          ListQuery = localStorage.getItem(`${this.props.type}ListQuery`) ?
            JSON.parse(localStorage.getItem(`${this.props.type}ListQuery`)) : {};
        } catch {
          console.log('异常')
        }

        const tagArr = (ListQuery && ListQuery.tag) || []; //如配置页删除，本地缓存也删除
        tagArr && tagArr.forEach((item) => {
          let a = false;
          data && data.forEach((it) => {
            if (it.id === item) {
              a = true;
            }
          });
          if (!a) {
            tagArr.splice(tagArr.indexOf(item), 1);
          }
        });
        const newListQuery = {
          ...ListQuery,
          tag: tagArr,
        };
        localStorage.setItem(`${this.props.type}ListQuery`, JSON.stringify(newListQuery));
        sessionStorage.setItem(`${this.props.type}ListQuery_${productid}`, JSON.stringify(newListQuery));
      }).catch((err) => {
        return message.error(err || err.msg);
      });

    } else if (key.includes('customfield')) {
      if (type !== 'default') {
        const arr = key.split('_');
        const params = {
          customfieldid: arr[arr.length - 1]
        };
        getCustomadvise(params).then((res) => { //获取建议自定义数据
          if (res.code !== 200) { return message.error(res.msg) }
          const data = [];
          res.result.forEach((item) => {
            data.push({
              id: item.id,
              name: item.customlabel,
              parentid: item.parentid,
            });
          });
          this.setState({ [`${key}-list`]: data });
        }).catch((err) => {
          return message.error(err || err.message);
        });
      } else {
        this.setState({ [`${key}`]: values });
      }
    }
  }

  onChangeFilter = (item, value) => {
    let newValue = value ? value : '';
    // 日期的需要转换下
    if (item.status === 999 || item.status === 8) {
      if (item.status === 999) {
        if (item.key.indexOf('start') > -1 || item.key === 'expectReleaseTimeStart') {
          newValue = value ? new Date(value).setHours(0, 0, 0, 0) : '';
        } else if (item.key.indexOf('end') > -1 || item.key === 'expectReleaseTimeEnd') {
          newValue = value ? new Date(value).setHours(23, 59, 59, 999) : '';
        }
      } else if (item.status === 8) {
        const newDate = value ? moment(value).format('YYYY-MM-DD') : '';
        newValue = newDate;
      }
    }
    this.props.updateFilter(item.key, newValue, item.status);
  }

  menu = () => {
    const { dataSource } = this.props;
    const { inputVal, selectArr } = this.state;
    return (<Menu>
      <div style={{ padding: '6px 12px' }}>
        <Input
          ref={this.textInput}
          placeholder='搜索内容'
          onChange={e => this.setState({ inputVal: e.target.value })} />
      </div>
      <div className={styles['m-menu']}>
        <div style={{ marginBottom: '10px' }}>
          <a onClick={() => this.clearAll()}>清空选择</a>
        </div>
        {dataSource
          .filter((item) => !inputVal || item.value.includes(inputVal))
          .map((item) => (<div key={item.key} className={styles['m-item']}>
            <Checkbox
              checked={selectArr.includes(item.key)}
              onChange={() => this.updateSelectArr(item.key)}
            >
              <span
                className='f-toe'
                style={{ maxWidth: '200px', display: 'inline-block', verticalAlign: 'middle', paddingBottom: '4px' }}>
                {item.value}
              </span>
            </Checkbox>
          </div>))}
      </div>
    </Menu>);
  }

  transArray = (key, array) => {
    const { parentParams } = this.state;
    const customArr = (parentParams && parentParams.customfield) ? JSON.parse(parentParams.customfield) : [];

    const toArray = (arr) => {
      let newArray = [];
      if (arr && arr.length > 0) {
        arr.map((item) => {
          newArray.push(Number(item));
        });
      }
      return newArray;
    };

    if (key.includes('customfield')) {
      const id = key.split('_')[1];
      const obj = customArr.find(it => it.customfieldid === id) || {};
      return toArray(obj.values) || [];
    } else {
      return toArray(array);
    }
  }

  getDefaultCascader = (arr, dataSource) => {
    // 后端要求的arr只传最后一个，因为arr只有一个值length为1
    let defaultData = [];
    const value = arr[0];
    if (value) {
      const obj = dataSource.find(it => it.id === value) || {};
      if (obj.parentid) {
        defaultData = [obj.parentid, obj.id];
      } else {
        defaultData = [value];
      }
    }
    return defaultData;
  }

  getCascaderData = (dataSource) => {
    const data = dataSource || [];
    let fatherData = data.filter(it => it.parentid === 0);
    fatherData.forEach((item) => {
      item.label = item.name;
      item.value = item.id;
      let children = [];
      data.forEach((it) => {
        if (item.id === it.parentid) {
          children.push({
            label: it.name,
            value: it.id,
          });
        }
      });
      item.children = children;
    });
    return fatherData;
  }

  getFilterSelect = (item) => {
    const { parentParams, userList } = this.state;
    const dataSource = this.state[`${item.key}-list`] || [];

    if (item.key === 'submituid' || item.key === 'requireuid') {
      return (
        <PersonFilterSelect
          type={`${this.props.type}-${item.key}`}
          onChange={(value) => this.onChangeFilter(item, value)}
          defaultValue={this.transArray(item.key, parentParams && parentParams[item.key]) || ''}
        />
      );
    } else if (item.status === CUSTOME_TYPE_MAP.CASCADER) { //级联选择
      return (
        <Cascader
          options={this.getCascaderData(dataSource)}
          expandTrigger="hover"
          onPopupVisibleChange={(flag) => flag && this.getSelectData(item.key, [], 'cascader')}
          onChange={(value) => { this.onChangeFilter(item, value) }}
          placeholder="请选择"
          value={this.getDefaultCascader(this.transArray(item.key, parentParams && parentParams[item.key]), dataSource) || ''}
        />
      );
    } else if (item.status === CUSTOME_TYPE_MAP.USERSELECT) { //成员选择
      return (
        <Select
          showSearch
          allowClear
          style={{ width: '180px' }}
          placeholder="请搜索成员并选择"
          onChange={(value) => { this.onChangeFilter(item, value) }}
          onSearch={(value) => handleSearchUser(value, () => {
            this.setState({ userList: res.result });
          })}
          value={this.state[item.key]}
        >
          {userList && userList.map((item) => (
            <Select.Option value={item.email}>
              {`${item.realname}-${item.email}`}
            </Select.Option>
          ))}
        </Select>
      );
    } else {
      return (
        <FilterSelectIssue
          getSelectData={this.getSelectData}
          selectkey={item.key}
          onChange={(value) => this.onChangeFilter(item, value)}
          dataSource={dataSource.map((item) => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={this.transArray(item.key, parentParams && parentParams[item.key]) || ''}
        />
      );
    }
  }

  focusTextInput = () => {
    setTimeout(() => {
      this.textInput.current && this.textInput.current.focus();
    }, 0);
  }

  render() {
    const { getPopupContainer } = this.props;
    const { visible, addQueryList, parentParams } = this.state;

    return (
      <span className='u-mgl10'>
        <Dropdown
          overlay={this.menu()}
          trigger={['click']}
          onClick={this.focusTextInput}
          visible={visible}
          onVisibleChange={this.onVisibleChange}
          getPopupContainer={getPopupContainer}
        >
          <span className={`f-csp ${styles.bgMore}`}>
            <span className={`${styles.name} f-toe f-vam`}>更多</span>
            <span className={`f-iaic ${styles.icon}`}>
              <MyIcon type="icon-icon-arrow" style={{ fontSize: '9px' }} />
            </span>
          </span>
        </Dropdown>
        <div>
          {
            addQueryList.map((item) => {
              if (item.status === CUSTOME_TYPE_MAP.INPUT || item.status === CUSTOME_TYPE_MAP.TEXTAREA) { // input
                return (
                  <div className='f-iaic'>
                    <span className="f-ib f-vam u-mgl20 grayColor">{item.value}：</span>
                    <Input
                      value={item.key.includes('customfield') ? this.state[`${item.key}`] : parentParams && parentParams[item.key]}
                      placeholder={item.value}
                      style={{ width: '150px' }}
                      onChange={(e) => this.setState({ [`${item.key}`]: e.target.value })}
                      onPressEnter={(e) => this.onChangeFilter(item, e.target.value)} />
                    <span className={`f-ib ${styles.icon} u-icon-close`}>
                      <CloseCircleFilled
                        onClick={e => this.deleteQuery(e, item.key, item.status)}
                        className={styles.closeIcon}
                        title="清空筛选" />
                    </span>
                  </div>
                );
              }
              if (item.status === CUSTOME_TYPE_MAP.SELECT || item.status === CUSTOME_TYPE_MAP.MULTISELECT || item.status === CUSTOME_TYPE_MAP.CASCADER || item.status === CUSTOME_TYPE_MAP.USERSELECT) { // select
                return (
                  <div
                    className='f-iaic'>
                    <span className="f-ib f-vam u-mgl20 grayColor">{item.value}：</span>
                    {
                      this.getFilterSelect(item)
                    }
                    <span className={`f-ib f-vam ${styles.icon} u-icon-close`}>
                      <CloseCircleFilled
                        onClick={e => this.deleteQuery(e, item.key, item.status)}
                        className={styles.closeIcon}
                        title="清空筛选" />
                    </span>
                  </div>
                );
              }
              if (item.status === CUSTOME_TYPE_MAP.INTERGER || item.status === CUSTOME_TYPE_MAP.DECIMAL) { // inputNumber
                const customValue = this.state[`${item.key}`] || [];
                return (
                  <div
                    className='f-iaic'>
                    <span className="f-ib f-vam u-mgl20 grayColor">{item.value}：</span>
                    <InputNumber
                      min={0}
                      step={item.status === CUSTOME_TYPE_MAP.INTERGER ? 1 : 0.1}
                      defaultValue={customValue[0]}
                      onChange={(value) => this.onChangeFilter(item, value)} />
                    <span className={`f-ib f-vam ${styles.icon} u-icon-close`}>
                      <CloseCircleFilled
                        onClick={e => this.deleteQuery(e, item.key, item.status)}
                        className={styles.closeIcon}
                        title="清空筛选" />
                    </span>
                  </div>
                );
              }
              if (item.status === 999 || item.status === CUSTOME_TYPE_MAP.DATEPICKER) { // datePicker
                const customValue = this.state[`${item.key}`] ? Array.isArray(this.state[`${item.key}`]) ? this.state[`${item.key}`][0] : this.state[`${item.key}`] : undefined;
                return (
                  <div style={{ display: 'inline-block' }}>
                    <span className="f-ib f-vam u-mgl20 grayColor">{item.value}：</span>
                    <StyleDatePicker
                      value={item.key.includes('customfield') ?
                        customValue ? moment(customValue) : undefined :
                        parentParams && parentParams[item.key] ? moment(Number(parentParams[item.key])) : undefined}
                      onChange={(value) => this.onChangeFilter(item, value)}
                      style={{ width: '150px' }} />
                  </div>
                );
              }
            })
          }
        </div>
      </span>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stoneName: state.createProject.stoneName,
  };
};

export default connect(mapStateToProps)(QueryMore);
