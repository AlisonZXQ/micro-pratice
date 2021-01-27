import React, { Component } from 'react';
import { Modal, Button, Select, message } from 'antd';
import { getCustomData, moveCustomField } from '@services/product_setting';
import { moveSystemField } from '@services/system_manage';
import MyIcon from '@components/MyIcon';
import { moveSuccessData } from '@shared/ProductSettingConfig';
import { CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import styles from '../index.less';

const Option = Select.Option;

class MoveModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moveVisible: false,
      moveData: true,
      success: false,
      newLabel: {},
      fieldList: [],
      successData: {},
    };
  }

  componentDidMount() {
  }

  getCustomList = (record) => {
    const params = {
      productid: this.props.productid,
    };
    getCustomData(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const list = res.result && res.result.filter((it) => {
        return it.type === record.type && it.id !== record.id && it.system === CUSTOME_SYSTEM.NOT_SYSTEM;
      });
      this.setState({ fieldList: list });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  confirmMove = () => {
    const { record, type } = this.props;
    const { newLabel } = this.state;
    const params = {
      id: record.id,
      moveId: Number(newLabel.key),
    };
    let Fun = null;
    if(type === 'system') {
      Fun = moveSystemField(params);
    }else {
      Fun = moveCustomField(params);
    }
    Fun.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ success: true, successData: res.result });
      this.props.getList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  openModal = (record) => {
    this.setState({ moveVisible: true });
    const { type, list } = this.props;
    if(type === 'system') {
      const data = list && list.filter((it) => {
        return it.type === record.type && it.id !== record.id && it.system === CUSTOME_SYSTEM.SYSTEM;
      });
      this.setState({ fieldList: data });
    }else {
      this.getCustomList(record);
    }
  }

  render() {
    const { moveVisible, newLabel, success, fieldList, successData } = this.state;
    const { record, type } = this.props;
    return (<span>
      <a onClick={() => this.openModal(record)}>迁移数据</a>

      <Modal
        title="数据迁移"
        visible={moveVisible}
        afterClose={() => this.setState({ success: false, moveVisible: false })}
        onCancel={() => this.setState({ moveVisible: false })}
        destroyOnClose
        width={500}
        footer={!success ?
          <span>
            <Button
              type='primary'
              disabled={JSON.stringify(newLabel) === '{}'}
              onClick={() => this.confirmMove()}
              style={{width: '156px'}}>
              完成迁移
            </Button>
          </span> :
          <span>
            <Button
              type='primary'
              onClick={() => { this.setState({ moveVisible: false })} }>
              完成
            </Button>
          </span>
        }
      >
        {!success && <span>
          <div>将字段【{ record.name }】数据迁移到目标字段上：</div>
          <Select
            style={{width: '100%', marginTop: '10px'}}
            placeholder='请选择'
            labelInValue
            onChange={(value) => this.setState({ newLabel: value })}>
            {fieldList && fieldList.map((item) => (
              <Option key={item.id} vlaue={item.id}>{item.name}</Option>
            ))}
          </Select>
          <div className={styles.moveLabel}>
            <span className='u-mgr10'>{ record.name }</span>
            <MyIcon type="icon-jiantoubianhuan" className={styles.icon} />
            <span className={`${styles.right} u-mgl10`}>{newLabel.label ? newLabel.label : '暂未选择'}</span>
          </div>
          {newLabel.label && <div className={styles.moveTip}>
            字段【{record.name}】的字段配置以及已有单据上设置的值均将被迁移到新字段【{newLabel.label}】上，您确认需要这样做吗？此操作不可撤消。
          </div>}
        </span>}

        {success && <span className={styles.success}>
          <span className={styles.successIcon}>
            <MyIcon type='icon-morengou' />
          </span>
          <div className={styles.successTip}>
            恭喜你，数据迁移完成啦！
          </div>
          <div className={styles.successLabel}>
            【{record.name}】字段配置及已有单据上设置的值均被迁移到新字段【{newLabel.label}】上了，具体迁移情况如下：
          </div>
          <div className={styles.successContent}>
            {moveSuccessData && moveSuccessData.map((item) => (
              <div>
                <span className='f-ib' style={{width: '150px', textAlign: 'right'}}>{item.name}：</span>
                <span>{successData[item.value]}</span>条
              </div>
            ))}
          </div>
        </span>}
      </Modal>
    </span>);
  }
}

export default MoveModal;
