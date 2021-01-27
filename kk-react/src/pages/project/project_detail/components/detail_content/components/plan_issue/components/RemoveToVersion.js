import React, { Component } from 'react';
import { Radio, message, Input, Empty, Modal } from 'antd';
import { getVersionList, versionPlanAdd } from '@services/version';
import { EXCLUDE_PUBLISH } from '@shared/ReceiptConfig';

const RadioGroup = Radio.Group;
const { Search } = Input;
const conntypeMap = {
  '需求': 1,
  '故事': 1,
  '任务': 3,
  '缺陷': 4,
};

class index extends Component {
  state = {
    versionList: [],
    name: '',
    visible: false,
    versionId: 0,
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  getVersionList = () => {
    const { projectBasic } = this.props;
    const productId = projectBasic && projectBasic.products && projectBasic.products[0] && projectBasic.products[0].id;
    const subProductId = projectBasic && projectBasic.subProductVO && projectBasic.subProductVO && projectBasic.subProductVO.id;

    const params = {
      productId,
      state: EXCLUDE_PUBLISH,
      subProductIdList: [subProductId]
    };
    getVersionList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ versionList: res.result || [] });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  processData = () => {
    const { versionList, name } = this.state;
    return versionList.filter(it => !name
      || (it.version && it.version.name && it.version.name.includes(name)));
  }

  handleOk = () => {
    const { data } = this.props;
    const { versionId } = this.state;
    const issueKey = data.issueKey;
    const connid = issueKey.split('-')[1];
    const issuetype = data.issuetype;
    const projectId = data.projectId;

    const params = {
      versionid: versionId,
      conntype: conntypeMap[issuetype],
      connid: Number(connid),
    };
    if(!versionId){
      return message.warning('请选择版本！');
    }
    versionPlanAdd(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('排入版本成功！');
      this.setState({ visible: false });
      this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { name, visible } = this.state;
    const { data } = this.props;

    return (<span onClick={(e) => e.stopPropagation()}>
      <Modal
        title="排入版本"
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        okText="排入版本"
        onOk={() => this.handleOk()}
        destroyOnClose
        maskClosable={false}
      >
        <div className="f-tar">
          <Search
            allowClear
            onChange={e => this.setState({ name: e.target.value })}
            style={{ width: '220px' }}
            placeholder="搜索标题"
            value={name}
          />
        </div>

        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {
            this.processData() && this.processData().length ?
              <RadioGroup onChange={(e) => this.setState({ versionId: e.target.value })}>
                {
                  this.processData().map(it => <div style={{ height: '25px', lineHeight: '25px' }}>
                    <Radio key={it.version.id} value={it.version.id}>
                      {it.version.name}
                    </Radio>
                  </div>)
                }
              </RadioGroup>
              :
              <Empty className="u-mgt20" />
          }
        </div>

      </Modal>
      <span onClick={(e) => {
        e.stopPropagation();
        this.setState({ visible: true, versionId: 0 });
        this.getVersionList();
        this.props.closeMoreVisible(data.id);
      }}>排入版本</span>
    </span>);
  }
}

export default index;
