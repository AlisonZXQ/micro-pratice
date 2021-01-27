import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import survey from '@assets/survey.png';
import styles from './index.less';

const SurveyModal = (() => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if(isNewVisitor()) {
      setVisible(true);
      setCookie("gznotes-visited", "true", 365);
    }
  }, []);

  const isNewVisitor = () => {
    var flg = getCookie("gznotes-visited");
    return flg === '';
  };

  const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";path=/";
  };

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
  }

  const handleOk = () => {
    setVisible(false);
    window.open('https://survey.dingwei.netease.com/htmls/tszgap/paper.html');
  };

  return <span>
    <Modal
      title='产品体验调研'
      visible={visible}
      width={'30%'}
      centered
      className={styles.survey}
      onCancel={() => setVisible(false)}
      footer={<span>
        <Button onClick={() => handleOk()} type='primary'>
          立即参与
        </Button>
      </span>}>
      <span className={styles.tip}>
        <div>特邀您参与“用户调研问卷”</div>
        <div>此次体验提升计划，我们需要您的声音</div>
        <div className='u-mgt10'>
          <img src={survey} alt='图片' />
        </div>
      </span>

    </Modal>
  </span>;
});

export default SurveyModal;
