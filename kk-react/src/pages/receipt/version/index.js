import React, { Component } from 'react';
import VersionDefault from './version_list/index';
import styles from './index.less';

class index extends Component {

  render() {

    return (<div className={`bgCard ${styles.container}`}>
      <VersionDefault />
    </div>);
  }
}

export default index;
