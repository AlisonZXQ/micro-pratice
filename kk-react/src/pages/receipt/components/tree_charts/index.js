import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { getFullLink } from '@services/receipt';
import { connTypeMap, connTypeIdMap } from '@shared/ReceiptConfig';
import TreeRender from './components/TreeRender';

class index extends Component {
  state = {
    visible: false,
    data: {},
  }

  componentDidMount() {
  }

  getFullLinkCharts = () => {
    const { type, parentIssueKey } = this.props;
    const params = {
      id: this.props.location.query[connTypeIdMap[type]] || parentIssueKey.split('-')[1],
      type: connTypeMap[type],
    };
    getFullLink(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const newData = res.result;
      newData.name = newData.label;
      newData.issueKey = newData.id;

      const childrenFn = (children) => {
        children.forEach(it => {
          it.name = it.label;
          it.issueKey = it.id;

          if (it.children) {
            childrenFn(it.children || []);
          }
        });
      };
      childrenFn(newData.children || []);
      this.setState({ data: newData || {} });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { type, parentIssueKey } = this.props;
    const { visible, data } = this.state;

    return (<span>
      <Modal
        title="单据关系链路图（包含目标-需求-任务-子任务完整树结构）"
        visible={visible}
        width={1000}
        onCancel={() => this.setState({ visible: false, data: {} })}
        footer={null}
        maskClosable={false}
        destroyOnClose
      >
        <TreeRender
          data={data}
          issueType={connTypeMap[type]}
          issueKey={parentIssueKey}
        />
      </Modal>
      <a onClick={() => { this.setState({ visible: true }); this.getFullLinkCharts() }}>查看完整链路</a>
    </span>);
  }
}
export default withRouter(index);
