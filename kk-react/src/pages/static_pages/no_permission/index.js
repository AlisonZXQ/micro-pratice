import React, { Component } from 'react';
import { Card } from 'antd';
import Error from '@components/Error';

class index extends Component {

  render() {
    return (<div className="u-mg15">
      <Card>
        <Error />
      </Card>
    </div>);
  }
}

export default index;
