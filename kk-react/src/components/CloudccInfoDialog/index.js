import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { queryCloudCC } from '@services/receipt';
import styles from './index.less';

class CloudccInfoDialog extends Component {
  constructor(props) {
    super(props);
    this.state={
      visible: false,
      data: []
    };
  }

  componentDidMount() {
    this.props.refThis(this);
  }

  getCloudccInfo = () => {
    this.setState({
      data: []
    });
    const {productid, cloudccId, cloudccTable}= this.props;
    const params={
      productid: productid,
      key: cloudccTable,
      field: "id",
      value: cloudccId,
      page: 1,
      limit: 1
    };
    if(cloudccId && cloudccId.trim().length){
      queryCloudCC(params).then(res => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(res.msg);
        const obj = res.result ? JSON.parse(res.result) : {};

        if(obj.data.length > 0 ){
          const cloudccRecord=obj.data[0];
          const keys = Object.keys(cloudccRecord);
          let data=[];
          keys.map((key)=>{
            //仅追加有值的内容
            if(cloudccRecord[key]){
              data.push({
                name: key,
                value: cloudccRecord[key]
              });
            }
          });
          this.setState({ data });
        }
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  }

  render() {
    const { visible, data}=this.state;

    return (<span>
      <Modal
        title="查看cloudcc信息"
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        width={600}
        maskClosable={false}
        footer={false}
      >
        <div className={styles.content}>
          <table >
            <colgroup>
              <col width="50%"/>
              <col width="50%"/>
            </colgroup>
            <tr>
              <th className="f-tar">字段名：</th>
              <th>字段值</th>
            </tr>
            {data.map(it=>{
              return (
                <tr>
                  <td className="f-tar">{it.name}：</td>
                  <td>{it.value ? it.value :'-'}</td>
                </tr>
              );
            })}
          </table>
        </div>
      </Modal>
    </span >);
  }
}

export default CloudccInfoDialog;

