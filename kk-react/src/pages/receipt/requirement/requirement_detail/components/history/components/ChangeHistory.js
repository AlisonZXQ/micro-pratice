import React, { Component } from 'react';
import HistoryDisplay from '@pages/receipt/components/history_display';
import { historyType, titleMap, keyMap } from '@shared/RequirementConfig';

class index extends Component {

  render() {
    const { history } = this.props;

    return (<HistoryDisplay
      history={history}
      name={'requirementHistory'}
      historyType={historyType}
      titleMap={titleMap}
      keyMap={keyMap}
    />);
  }
}

export default index;
