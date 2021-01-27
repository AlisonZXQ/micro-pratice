import React, { Component } from 'react';
import HistoryDisplay from '@pages/receipt/components/history_display';
import { historyType, titleMap, keyMap } from '@shared/BugConfig';

class index extends Component {

  render() {
    const { history } = this.props;

    return (<HistoryDisplay
      history={history}
      name={'bugHistory'}
      historyType={historyType}
      titleMap={titleMap}
      keyMap={keyMap}
    />);
  }
}

export default index;
