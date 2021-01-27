import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Checkbox, Input, message } from 'antd';
import debounce from 'lodash/debounce';
import { connect } from 'dva';
import { equalsObj, deepCopy } from '@utils/helper';
import { queryUser } from '@services/project';
import { getUserList } from '@services/requirement';
import styles from './index.less';

const MenuItem = Menu.Item;

class FilterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectArr: [],
      otherSelectArr: [],
      userList: [],
      dataSource: [],
      inputValue: '',
      visible: false,
    };
    this.handleSearchUser = debounce(this.handleSearchUser, 800);
    this.textInput = React.createRef();
  }

  componentDidMount() {
    const { defaultValue, currentUser } = this.props;
    if (defaultValue) {
      this.setState({ selectArr: defaultValue });
    }

    //获取当前用户id
    const nextId = currentUser && currentUser.user && currentUser.user.id;
    if (nextId) {
      this.getDefaultData(nextId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.defaultValue, nextProps.defaultValue)) {
      this.setState({ selectArr: nextProps.defaultValue });
    }

    //获取当前用户id
    const nextId = nextProps.currentUser && nextProps.currentUser.user && nextProps.currentUser.user.id;
    const beforeId = this.props.currentUser && this.props.currentUser.user && this.props.currentUser.user.id;

    if (nextId !== beforeId) {
      this.getDefaultData(nextId);
    }
  }

  getDefaultData = (id) => {
    const nextId = id || this.props.currentUser.user.id;

    const responseList = [{
      value: nextId,
      realname: '当前用户'
    }, {
      value: 0,
      realname: '未分配'
    }];
    this.setState({ dataSource: responseList });

    const arr = this.props.type && this.props.type.split('-');
    let listQuery = {};
    if (arr[0].length > 0) {
      listQuery = localStorage.getItem(`${arr[0]}ListQuery`);
    }
    let data = [];
    try {
      data = listQuery ? JSON.parse(listQuery)[arr[1]] : [];
    } catch {
      data = [];
    }
    data = this.transArray(data);
    if (data.indexOf(nextId) > -1) {
      data.splice(data.indexOf(nextId), 1);
    }
    if (data.indexOf(0) > -1) {
      data.splice(data.indexOf(0), 1);
    }
    if (data.length > 0) {
      this.getOtherUser(data);
    }
  }

  transArray = (array) => {
    const arr = array || [];
    let newArray = [];
    arr.forEach((item) => {
      newArray.push(Number(item));
    });

    return newArray;
  }

  getOtherUser = (data) => {
    const params = {
      idList: data,
    };
    getUserList(params).then((res) => {
      if (res.code !== 200) return message.error('查询用户列表失败', res.message);
      if (res.result) {
        this.setState({ otherSelectArr: res.result });
      }
    }).catch((err) => {
      return message.error('查询用户列表异常', err || err.message);
    });
  }

  onVisibleChange = (visible) => this.setState({ visible });

  updateSelectArr = (value, item) => {
    const { onChange, currentUser } = this.props;
    const { selectArr, otherSelectArr } = this.state;
    const currentId = currentUser.user.id;
    let arr = [];

    let newOtherSelectArr = deepCopy(otherSelectArr, []);
    // 更新otherSelectArr,如果选择的是当前用户不更新到otherSelectArr
    if (item && value !== currentId) {
      if (newOtherSelectArr.some(it => it.id === value)) { // 删除
        newOtherSelectArr = newOtherSelectArr.filter(it => it.id !== value);
      } else {
        newOtherSelectArr.push(item);
      }
      this.setState({ otherSelectArr: newOtherSelectArr });
    }

    if (selectArr.includes(value)) { // 删除
      arr = selectArr.filter(item => item !== value);

    } else { // 增加
      arr = [...selectArr, value];
    }
    this.setState({ selectArr: arr });
    onChange(arr);
  }

  clearSelect = (e) => {
    e.stopPropagation();
    // 清除掉已保存的name，避免问题
    this.props.dispatch({ type: 'createProject/saveStoneName', payload: name });

    const { onChange } = this.props;
    this.setState({ selectArr: [] });
    onChange([]);
  }

  matchLabel = (value) => {
    const { dataSource, otherSelectArr } = this.state;

    const defaultData = dataSource.find((item) => item.value === value) ||
      otherSelectArr.find((item) => item.id === value);
    const newName = (defaultData && defaultData.realname) || '';
    return defaultData ? newName.replace('yixin.', '') : value;
  }

  handleSearchUser = (value) => {
    const { otherSelectArr, selectArr } = this.state;
    let newOtherSelectArr = deepCopy(otherSelectArr, []);
    if (!value.length) { // 清空时的操作
      newOtherSelectArr = newOtherSelectArr.filter(it => selectArr.includes(it.id));
      this.setState({ otherSelectArr: newOtherSelectArr });
    }
    this.setState({ inputValue: value });
    const params = {
      value: value,
      offset: 0,
      limit: 10,
    };
    if (value.trim().length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error('查询用户列表失败', res.message);
        if (res.result) {
          let arr = [];
          res.result.map((item) => {
            arr.push({
              value: item.id,
              id: item.id,
              realname: item.realname,
              email: item.email,
            });
          });
          this.setState({ userList: arr });
        }
      }).catch((err) => {
        return message.error('查询用户列表异常', err || err.message);
      });
    }
  }

  menu = () => {
    const { dataSource, otherSelectArr, selectArr, userList, inputValue } = this.state;

    return (<Menu>
      <div style={{ padding: '6px 12px' }}>
        <Input
          ref={this.textInput}
          onChange={e => this.handleSearchUser(e.target.value)}
          allowClear placeholder='搜索内容' />
      </div>

      <div className={styles['m-menu']}>
        {
          !inputValue.length &&
          <span>
            <div style={{ marginBottom: '10px' }}>
              <a onClick={this.clearSelect}>清空选择</a>
            </div>

            {
              dataSource
                .map((item) => (<div key={item.value} className={styles['m-item']}>
                  <Checkbox
                    checked={selectArr.includes(item.value)}
                    onChange={() => this.updateSelectArr(item.value)}
                  >{item.realname}</Checkbox>
                </div>))
            }

            <div className={styles.container}>
              {
                otherSelectArr.length > 0 ? otherSelectArr.map((item) => (
                  <div key={item.id} className={`${styles['m-item']}`}>
                    <Checkbox
                      className='f-toe'
                      style={{ width: '180px' }}
                      checked={selectArr.includes(item.id)}
                      onChange={() => this.updateSelectArr(item.id)}
                    >{item.realname}-{item.email}
                    </Checkbox>
                  </div>
                )) :
                  <div className={`${styles['m-item']} f-tac`}>暂无数据</div>
              }
            </div>
          </span>
        }

        {
          !!inputValue.length &&
          userList
            .map((item) => (<div key={item.value} className={`${styles['m-item']}`}>
              <Checkbox
                className='f-toe'
                style={{ width: '180px' }}
                checked={selectArr.includes(item.value)}
                onChange={() => this.updateSelectArr(item.value, item)}
              >{`${item.realname}-${item.email}`}</Checkbox>
            </div>))
        }
      </div>
    </Menu>);
  }

  clickParent = () => {
    const key = this.props.selectkey;
    if (key) {
      this.props.getSelectData(key);
    }
  }

  focusTextInput = () => {
    setTimeout(() => {
      this.textInput.current && this.textInput.current.focus();
    }, 0);
  }

  render() {
    const { getPopupContainer } = this.props;
    const { selectArr, visible } = this.state;

    return (
      <Dropdown
        overlay={this.menu()}
        trigger={['click']}
        onClick={this.focusTextInput}
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        getPopupContainer={getPopupContainer}
      >
        <span className="f-csp">
          <span
            onClick={() => this.clickParent()}
            className={`${styles.name} f-toe f-vam`}>
            {selectArr.length ? selectArr.map(item => this.matchLabel(item)).join(',') : '全部'}</span>
          <span className={`f-ib f-vam ${styles.icon}`}><CaretDownOutlined /></span>
        </span>
      </Dropdown>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stoneName: state.createProject.stoneName,
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(FilterSelect);
