import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Card } from 'antd';
import { connect } from 'dva';
import UploadFilesIssue from '@components/UploadFilesIssue';

class Local extends Component {

  componentDidMount() {
    const {form: { setFieldsValue }} = this.props;
    setFieldsValue({attachments: []});
  }

  render() {
    const { issueRole, roleGroup, form: { getFieldDecorator } } = this.props;

    return (<Card style={{ minHeight: '300px' }} className="u-mgt15">
      {
        getFieldDecorator('attachments', {
          initialValue: [],
        })(
          <UploadFilesIssue
            issueRole={issueRole}
            roleGroup={roleGroup}
          />
        )
      }
    </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
  };
};

export default withRouter(connect(mapStateToProps)(Local));
