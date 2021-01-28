import React, { useState } from 'react';

export const layout = {
  title: '商城管理',
  menuDataRender: () => ([{
    name: '商铺管理',
    path: '/shop'
  }, {
    name: '用户管理',
    path: '/user'
  }, {
    name: 'easy project',
    path: '/ep'
  }, {
    name: 'sub-react',
    path: '/sub-react'
  }, {
    name: 'umi2-ep',
    path: '/umi2-ep'
  }])
}

export const useQiankunStateForSlave = () => {
  const [globalState, setQiankunGlobalState] = useState({
    slogan: 'Hello MicroFrontend',
  });

  return {
    globalState,
    setQiankunGlobalState,
  };
};
