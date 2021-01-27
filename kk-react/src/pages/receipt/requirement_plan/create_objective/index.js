import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Button, Menu } from 'antd';
import CreateObjective from '@pages/receipt/components/create_objective';
import { PROJECT_STATUS_MAP } from '@shared/ProjectConfig';
import OrganizeObjective from '@components/OrganizeObjective';
import OKRObjective from '@components/OKRObjective';

function Index({ refreshFun, productId }) {
  const [visible, setVisible] = useState(false);

  const menu = () => {
    return (<Menu>
      {/* <div onClick={() => setVisible(false)}>
        <CreateObjective
          refreshFun={refreshFun}
          productid={productId}
          trigger={<span className="menuItem">
            创建目标
          </span>}
        />
      </div> */}
      <div onClick={() => setVisible(false)}>
        <OrganizeObjective
          trigger={<span className="menuItem">添加组织目标</span>}
          productId={productId}
          refreshFun={refreshFun}
          isNotChange={status !== PROJECT_STATUS_MAP.DOING}
        />
      </div>
      <div onClick={() => setVisible(false)}>
        <OKRObjective
          trigger={<span className="menuItem">导入OKR系统目标</span>}
          productId={productId}
          refreshFun={refreshFun}
        />
      </div>
    </Menu>);
  };

  return (
    <Dropdown
      overlay={menu()}
      visible={visible}
      onVisibleChange={visible => setVisible(visible)}
    >
      <Button type='primary'>
        添加目标
        <DownOutlined className="f-fs1" />
      </Button>
    </Dropdown>
  );
}

export default Index;
