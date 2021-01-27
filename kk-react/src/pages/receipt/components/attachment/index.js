import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, message } from 'antd';
import { connect } from 'dva';
import { getIssueKey } from '@utils/helper';
import UploadFilesIssue from '@components/UploadFilesIssue';
import { connTypeMapIncludeProject, ATTACHMENT_TYPE_MAP } from '@shared/CommonConfig';
import { updateAttachment } from '@services/requirement';
import { deleteAttachment } from '@services/receipt';

class index extends Component {

  componentDidMount() {
    this.getReqAttachment();
  }

  updateAttachment = (data) => {
    const { type, connid } = this.props;
    const { id: projectId } = this.props.location.query;
    const params = {
      ...data,
      conntype: connTypeMapIncludeProject[type],
      connid: type === 'project' ? projectId : getIssueKey() || connid,
    };
    updateAttachment(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success( data.type === ATTACHMENT_TYPE_MAP.BLOB ? '添加文件附件成功！': '添加链接附件成功!');
      this.getReqAttachment();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getReqAttachment = () => {
    const { type, connid } = this.props;
    const { id: projectId } = this.props.location.query;
    const attachmentParams = {
      conntype: connTypeMapIncludeProject[type],
      connid: type === 'project' ? projectId : getIssueKey() || connid,
    };
    this.props.dispatch({ type: 'design/getReqAttachment', payload: attachmentParams });
  }

  getExtraFile = () => {
    const { reqAttachment } = this.props;
    const arr = [];
    if (reqAttachment) {
      reqAttachment.forEach(it => {
        if (it.attachment) {
          arr.push({
            ...it.attachment,
            attachmentId: it.attachment.id,
          });
        }
      });
    }
    return arr;
  }

  handleDelete = (id) => {
    deleteAttachment({ id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('删除附件成功!');
      this.getReqAttachment();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { issueRole, roleGroup, form: { getFieldDecorator } } = this.props;

    return (<Card style={{ minHeight: '500px' }} className="u-mgt15">
      {
        getFieldDecorator('attachments', {
          initialValue: this.getExtraFile(),
        })(
          <UploadFilesIssue
            issueRole={issueRole}
            roleGroup={roleGroup}
            type={this.props.type}
            connid={getIssueKey() || this.props.connid}
            fromDetail={this.props.fromDetail}
            defaultValue={this.getExtraFile()}
            handleSave={this.updateAttachment}
            handleDelete={this.handleDelete}
          />
        )
      }
    </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
    reqAttachment: state.design.reqAttachment,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(index)));
