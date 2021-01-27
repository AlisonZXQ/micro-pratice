import React, { Component } from 'react';
import { Select, AutoComplete, Input } from 'antd';
import MyIcon from '@components/MyIcon';

const Option = Select.Option;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeList: {
        advise: 'Feedback-',
        requirement: 'Feature-',
        task: 'Task-',
        bug: 'Bug-',
        objective: 'Objective-',
        ticket: 'Ticket-'
      },
      typeMap: {
        advise: '建议',
        requirement: '需求',
        task: '任务',
        bug: '缺陷',
        objective: '目标',
        ticket: '工单'
      },
      optionValue: '',
      value: undefined,
      firstNum: false,
    };
  }

  componentDidMount() {
    const { defaultValue } = this.props;
    if (defaultValue) {
      this.setState({ value: defaultValue });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultValue !== this.props.defaultValue) {
      if (nextProps.defaultValue) {
        this.setState({ value: nextProps.defaultValue });
      } else {
        this.setState({ value: undefined });
      }
    }
  }

  handleSearch = (value) => {
    this.setState({ firstNum: false });

    const { type } = this.props;
    let oValue = '';
    if (('Feedback-'.slice(0, value.length) === value || 'feedback-'.slice(0, value.length) === value) && type === 'advise') {
      this.setState({ firstNum: true });
      oValue = 'Feedback-';
    } else if (('Feature-'.slice(0, value.length) === value || 'feature-'.slice(0, value.length) === value) && type === 'requirement') {
      this.setState({ firstNum: true });
      oValue = 'Feature-';
    } else if (('Task-'.slice(0, value.length) === value || 'task-'.slice(0, value.length) === value) && type === 'task' ) {
      this.setState({ firstNum: true });
      oValue = 'Task-';
    } else if (('Bug-'.slice(0, value.length) === value || 'bug-'.slice(0, value.length) === value) && type === 'bug') {
      this.setState({ firstNum: true });
      oValue = 'Bug-';
    } else if (('Objective-'.slice(0, value.length) === value || 'objective-'.slice(0, value.length) === value) && type === 'objective') {
      this.setState({ firstNum: true });
      oValue = 'Objective-';
    } else if (('Ticket-'.slice(0, value.length) === value || 'ticket-'.slice(0, value.length) === value) && type === 'ticket') {
      this.setState({ firstNum: true });
      oValue = 'Ticket-';
    }
    this.setState({ optionValue: oValue });
  }

  checkIsId = (newValue) => {
    const idArr = ['Feedback-', 'Feature-', 'Task-', 'Bug-', 'Objective-', 'Ticket'];
    let isId = false;
    idArr.forEach((it) => {
      if(newValue.indexOf(it) > -1) {
        isId = true;
      }
    });
    return isId;
  }

  handleChange = (value) => {
    const isnum = /^\d+$/.test(value);
    const { type } = this.props;
    const { typeList } = this.state;
    this.setState({ value });

    let newValue = '';
    if(isnum && type) {
      newValue = typeList[type] + value;
    }else if(this.state.optionValue.length > 0){
      newValue = this.state.optionValue;
    }else {
      newValue = value;
    }
    this.props.updateFilter(newValue && this.checkIsId(newValue) ? 'id' : 'name', newValue);
  }

  render() {
    const { optionValue, firstNum, value } = this.state;

    const options = optionValue ?
      [<Option key={`1`} value={optionValue}>{optionValue}</Option>] : [];

    return (<span>
      <AutoComplete
        className="certain-category-search u-mgr20"
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={true}
        dropdownStyle={{ width: 234 }}
        value={value}
        style={{ width: '234px' }}
        dataSource={options}
        placeholder="请输入标题或ID"
        optionLabelProp="value"
        onSearch={(value) => this.handleSearch(value)}
        onChange={(value) => value ? this.setState({ value: value }) : this.handleChange('')}
        dropdownRender={menu => (
          <div>
            {firstNum && <div
              style={{ padding: '4px 8px', cursor: 'pointer' }}
              onMouseDown={e => e.preventDefault()}
            >
              点击<span style={{fontWeight: 'blod'}}>“ENTER”</span>自动键入下方标识：
            </div>}
            {menu}
          </div>
        )}
      >
        <Input
          style={{width: '234px'}}
          suffix={<MyIcon
            type="icon-sousuo"
            onClick={() => this.handleChange(value)}
            className="certain-category-icon" />}
          onPressEnter={(e) => this.handleChange(e.target.value)}
          allowClear
        />
      </AutoComplete>
    </span>);
  }
}

export default index;
