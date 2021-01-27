import React from 'react';
import { DeleteTwoTone } from '@ant-design/icons';
import { Upload, message, Row, Col, Spin, Popconfirm } from 'antd';
import uuid from 'uuid';
import { uploadFile } from '@services/requirement';
import { equalsObj } from '@utils/helper';
import uploadIcon from '@assets/upload-cloud.png';
import styles from './index.less';

const { Dragger } = Upload;

class index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      loading: false,
    };
  }

  componentDidMount() {
    const { defaultValue } = this.props;
    if (defaultValue) {
      this.setState({ fileList: defaultValue });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { fileList } = this.state;

    const nextValue = nextProps.value;

    if (!equalsObj(fileList, nextValue)) {
      this.setState({ fileList: nextValue });
    }
  }

  customRequest = (option) => {
    const { fileList } = this.state;
    const formData = new FormData();
    formData.append('file', option.file);
    this.setState({ loading: true });
    uploadFile(formData).then(res => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        const obj = {
          ...res.result,
          id: uuid(),
        };
        const newFileList = [...fileList];
        newFileList.push(obj);
        this.setState({ fileList: newFileList });
        this.props.onChange(newFileList);
      }
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(err || err.message);
    });
  }

  beforeUpload = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 40;
    if (!isLt2M) {
      message.error('单个文件必须小于40MB!');
    }
    return isLt2M;
  }

  handleClick = (id) => {
    const { fileList } = this.state;
    const newFileList = [...fileList];

    this.props.onChange(newFileList.filter(it => it.id !== id));

    this.setState({
      fileList: newFileList.filter(it => it.id !== id)
    });
  }

  render() {
    const { fileList, loading } = this.state;

    return (
      <div className={styles.container}>
        <Spin spinning={loading} tip="文件上传中">
          <div className={styles.uploadC}>
            <Dragger
              beforeUpload={this.beforeUpload}
              className={styles.dragger}
              customRequest={this.customRequest}
              showUploadList={false}
            >
              <div className={styles.upload}>
                <img src={uploadIcon} alt="upload" className={styles.icon} />
                <span className={styles.text}>点击或将文件拖拽到这里上传，单个文件不超过40M</span>
              </div>
            </Dragger>
          </div>
        </Spin>

        {fileList.map(it => <Row className="u-mgt5">
          <Col span={22}>
            <a href={it.url} download={it.name}>{it.name}</a>
          </Col>
          <Col span={2}>
            <Popconfirm
              title="确定删除该附件吗?"
              onConfirm={() => this.handleClick(it.id)}
              okText="确定"
              cancelText="取消"
            >
              <DeleteTwoTone className="f-fr f-csp" style={{ paddingTop: '8px' }} />
            </Popconfirm>
          </Col>
        </Row>)}
      </div>
    );
  }
}

export default index;
