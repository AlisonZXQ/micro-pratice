import React from 'react';
import { Link } from 'umi';
import styles from './index.less';

// menuDataRender: () => ([{
//   name: '商铺管理',
//   path: '/shop'
// }, {
//   name: '用户管理',
//   path: '/user'
// }, {
//   name: 'easy project',
//   path: '/ep'
// }, {
//   name: 'sub-react',
//   path: '/sub-react'
// }, {
//   name: 'umi2-ep',
//   path: '/umi2-ep'
// }])

export default (props: any) => {
  return (
    <div>
      <span style={{ marginRight: '10px' }}>
        <Link to={'/show'}>shop</Link>
      </span>

      <Link to={'/easyproject'}>easyproject</Link>

      大家都来看看吧 很搞笑的哈哈哈哈哈哈
      <div className={styles.container}>
        {props.children}
      </div>
    </div>
  );
}
