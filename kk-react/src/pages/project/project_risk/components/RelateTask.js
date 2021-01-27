import React, { Component } from 'react';
import { Checkbox, message, Modal, Input } from 'antd';
import { getRiskRelateTask, batchBindTask } from '@services/risk';

const CheckboxGroup = Checkbox.Group;
const Search = Input.Search;

class index extends Component {
  state = {
    visible: false,
    name: '',
    taskList: [],
    taskIds: [],
    loading: false,
  }

  componentDidMount() {
  }

  getRiskRelateTask = () => {
    const { name } = this.state;
    const params = {
      name,
      limit: 20,
      offset: 0,
    };
    getRiskRelateTask(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ taskList: res.result.list || [] });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { parentData } = this.props;
    const { taskIds } = this.state;
    if (!taskIds.length) {
      return message.warn('请先选择任务！');
    }

    const params = {
      riskId: parentData.id,
      taskIdList: taskIds,
    };
    this.setState({ loading: true });
    batchBindTask(params).then(res => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      this.props.getRiskList();
    }).catch(err => {
      this.setState({ loading: false });
      return message.error(err || err.message);
    });
  }

  render() {
    const { visible, name, taskList, taskIds, loading } = this.state;

    return (<span>
      <Modal
        title="关联任务"
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        onOk={() => this.handleOk()}
        okButtonProps={{ loading }}
        destroyOnClose
        maskClosable={false}
      >
        <div className="f-tar">
          <Search
            allowClear
            onSearch={(value) => this.setState({ name: value }, () => this.getRiskRelateTask())}
            style={{ width: '220px' }}
            placeholder="搜索标题"
            value={name}
          />
        </div>

        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          <CheckboxGroup onChange={(value) => this.setState({ taskIds: value })} value={taskIds}>
            {
              taskList && taskList.map(it => <div style={{ height: '25px', lineHeight: '25px' }}>
                <Checkbox key={it.id} value={it.id}>
                  {it.name}
                </Checkbox>
              </div>)
            }
          </CheckboxGroup>
        </div>

      </Modal>
      <a onClick={() => {this.setState({ visible: true }); this.getRiskRelateTask()}}>关联任务</a>
    </span>);
  }

}

export default index;
