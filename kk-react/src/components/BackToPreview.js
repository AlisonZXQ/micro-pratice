import React from 'react';
import { Link } from 'umi';
import MyIcon from '@components/MyIcon';

/**
 * @desc 返回上一级
 * @param {*} params
 */
const BackToPreview = ({ link, title, callback }) => {

  const getContent = () => {
    return (<span>
      <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
      {title}
    </span>);
  };

  return (<span>
    {
      link &&
      <Link
        to={link}
        className="u-subtitle u-mgt5"
      >
        {getContent()}
      </Link>
    }
    {
      callback && <span
        onClick={() => callback()}
        className="f-csp"
      >
        {getContent()}
      </span>
    }
  </span>);
};

export default BackToPreview;
