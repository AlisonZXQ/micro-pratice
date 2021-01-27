import React from 'react';
import { Modal } from 'antd';

function CustomModal(props) {

  return (<>
    <Modal
      maskClosable={false}
      {...props}
    />
  </>);
}

export default CustomModal;
