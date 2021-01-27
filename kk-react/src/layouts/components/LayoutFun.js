import {
  issuesUrl, urlPrefix, staticPagesUrl, receiptDetailArr, loginPathname,
  LAYOUT_HEADER_TYPE_MAP, LAYOUT_SIDEBAR_TYPE_MAP, PRODUCT_MANAGE_MAP, oldReceiptDetailArr, manageUrl,
  productChangeRelace
} from '@shared/LayoutConfig';

// 项目管理
const isProjectUri = (pathname) => {
  return pathname.includes('project');
};

// 其他
const isOtherUri = (pathname) => {
  return pathname.includes('/message/list')
    || pathname.includes('my_workbench')
    || pathname.includes('user_info');
};

// 目标管理
const isObjectiveUri = (pathname) => {
  return pathname.includes('objective_manage');
};

// 产品设置
const isProductSettingUri = (pathname) => {
  return pathname.includes('product_setting');
};

// 系统设置
const isSystemSettingUri = (pathname) => {
  return pathname.includes('system_manage');
};

// 帮助文档
const getHelpUrl = (isBusiness) => {
  return isBusiness ? 'https://www.njdiip.com/help/documents?id=424654546906787840' : 'https://kms.netease.com/topics/topic/247';
};

export {
  isProjectUri,
  isOtherUri,
  isObjectiveUri,
  isProductSettingUri,
  isSystemSettingUri,
  getHelpUrl
};
