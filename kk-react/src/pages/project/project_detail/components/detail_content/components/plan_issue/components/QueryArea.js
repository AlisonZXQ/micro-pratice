import React, { Component } from 'react';
import { Input } from 'antd';
import { connect } from 'dva';
import FilterSelect from '@components/FilterSelect';
import { getContainer } from '@utils/helper';

const Search = Input.Search;

const mileStoneArr = [{
  label: '是',
  value: 1,
}, {
  label: '否',
  value: 2,
}];

class QueryArea extends Component {

  state = {
    name: '',
  }

  componentDidMount() {
    const { stoneName } = this.props;
    if (stoneName) {
      this.getDefaultValue(stoneName);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.stoneName !== nextProps.stoneName) {
      this.getDefaultValue(nextProps.stoneName);
    }
  }

  getDefaultValue = (name) => {
    this.setState({ name });
    this.props.updateFilter('summary', name);
  }

  setName = (name) => {
    this.setState({ name });
    if (!name.length) {
      this.props.dispatch({ type: 'createProject/saveStoneName', payload: '' });
    }
  }

  render() {
    const { updateFilter, statusArr, issueTypeArr, assigneeArr } = this.props;
    const { name } = this.state;

    return (
      <span className="u-mgb10 u-mgt10 m-query" id="container">
        <span className='queryHover'>
          <span className="f-ib f-vam">状态：</span>
          <FilterSelect
            onChange={(value) => updateFilter('status', value)}
            dataSource={statusArr && statusArr.map((item) => ({
              label: item, value: item,
            }))}
            getPopupContainer={getContainer}
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam">类型：</span>
          <FilterSelect
            onChange={(value) => { updateFilter('issuetype', value) }}
            dataSource={issueTypeArr && issueTypeArr.map((item) => ({
              label: item, value: item,
            }))}
            getPopupContainer={getContainer}
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam">里程碑：</span>
          <FilterSelect
            type="mileStone"
            onChange={(value) => { updateFilter('milestoneName', value) }}
            dataSource={mileStoneArr && mileStoneArr.map((item) => ({
              label: item.label, value: item.value,
            }))}
            getPopupContainer={getContainer}
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam">负责人：</span>
          <FilterSelect
            onChange={(value) => { updateFilter('assignee', value) }}
            dataSource={assigneeArr && assigneeArr.map((item) => ({
              label: item, value: item,
            }))}
            getPopupContainer={getContainer}
          />
        </span>

        <Search
          allowClear
          className="u-mgl20"
          onChange={e => { updateFilter('summary', e.target.value); this.setName(e.target.value) }}
          style={{ width: '220px', position: 'relative', top: '2px' }}
          placeholder="搜索标题"
          value={name}
        />
      </span>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stoneName: state.createProject.stoneName,
  };
};

export default connect(mapStateToProps)(QueryArea);
