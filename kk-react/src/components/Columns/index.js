import React, { Component } from 'react';
import { Dropdown, Input, Menu, Checkbox, Button } from 'antd';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      inputVal: '',
      columns: [],
      selectArr: [],
    };
    this.textInput = React.createRef();
  }

  componentDidMount() {
    this.setState({ selectArr: localStorage.getItem(`${this.props.type}_column`) ? JSON.parse(localStorage.getItem(`${this.props.type}_column`)) : [] });
  }

  handleChange = (key) => {
    const { selectArr } = this.state;
    let arr = [];
    if (selectArr && selectArr.includes(key)) {
      arr = selectArr.filter(item => item !== key);
    } else {
      arr = [...selectArr, key];
    }
    this.setState({ selectArr: arr });
  }

  isDefault = () => { //恢复缺省值
    const { defaultColumns } = this.props;
    let arr = [];
    defaultColumns.map((item) => {
      arr.push(item.key);
    });
    this.setState({ selectArr: arr });
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.columns !== this.props.columns){
      this.setState({ columns: nextProps.columns });
    }
  }

  saveField = (e) => {
    const { selectArr } = this.state;
    e.stopPropagation();
    this.setState({ visible: false });
    localStorage.setItem(`${this.props.type}_column`, JSON.stringify(selectArr));
    this.props.setColumns(selectArr);
  }

  cancle = (e) => {
    e.stopPropagation();
    this.setState({ visible: false });
    this.setState({ selectArr: JSON.parse(localStorage.getItem(`${this.props.type}_column`)) });
  }

  menu = () => {
    const { columns, selectArr, inputVal } = this.state;
    return (<Menu>
      <div style={{padding: '6px 12px'}}>
        <Input
          ref={this.textInput}
          placeholder='搜索内容'
          onChange={e => this.setState({ inputVal: e.target.value })} />
      </div>
      <div className={styles['m-menu']}>
        <div style={{marginBottom: '10px'}}>
          <a onClick={() => this.isDefault()}>恢复缺省值</a>
        </div>
        <div className={styles.checkbox}>
          {columns
            .filter(it => !inputVal || it.label.includes(inputVal))
            .map((item) => (<div key={item.key} className={styles['m-item']}>
              <Checkbox
                key={item.key}
                checked={selectArr && selectArr.includes(item.key)}
                onChange={() => this.handleChange(item.key)}>
                <span
                  className='f-toe'
                  style={{maxWidth: '200px', display: 'inline-block', verticalAlign: 'middle', paddingBottom: '4px'}}>
                  {item.label}
                </span>
              </Checkbox>
            </div>))}
        </div>
        <div className='u-mgt10 f-tar'>
          <Button size='small' type='primary' onClick={(e) => this.saveField(e)}>完成</Button>
          <Button className='u-mgl10' size='small' onClick={(e) => this.cancle(e)}>取消</Button>
        </div>
      </div>
    </Menu>);
  }

  focusTextInput = () => {
    setTimeout(() => {
      this.textInput.current && this.textInput.current.focus();
    }, 0);
  }

  render() {
    const { visible } = this.state;
    return (<div className={`u-mgr20 f-csp`}>
      <Dropdown
        visible={visible}
        onVisibleChange={(visible) => this.setState({ visible })}
        overlay={this.menu()}
        onClick={this.focusTextInput}
        trigger={['click']}
        placement="bottomRight">
        <span className={`f-aic f-jcc-aic ${styles.columns}`}>
          <span>列</span>
          <MyIcon type='icon-xia' style={{ fontSize: '9px', marginLeft: '4px' }} />
        </span>
      </Dropdown>
    </div>);
  }
}

export default Index;
