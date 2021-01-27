import React, { Component } from 'react';
import EpComment from './components/EpComment';
import JiraComment from './components/JiraComment';

class index extends Component {


  render() {
    const { issueKey } = this.props;

    return (
      // issueKey ?
      //   <JiraComment {...this.props} />
      //   :
      <EpComment {...this.props} />
    );
  }
}

export default index;
