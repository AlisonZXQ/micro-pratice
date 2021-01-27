import React, { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { Modal, Table, message, Button } from 'antd';
import { getUnLinkedList } from '@services/requirement_plan';
import DefineDot from '@components/DefineDot';
import { requirementNameMap, requirementColorDotMap } from '@shared/CommonConfig';
import { issueRelationAdd } from '@services/receipt';
import { connTypeMap } from '@shared/ReceiptConfig';
import EpIcon from '@components/EpIcon';
import TextOverFlow from '@components/TextOverFlow';
import TwoColumnsQuery from './TwoColumnsQuery';

function AddUninkedRequirement({ productid, parentIssueId, getPlanList }) {
  const [visible, setVisible] = useState(false);
  const [filterObj, setFilterObj] = useState({});
  const [unLinkedObj, setUnlinkedObj] = useState({});
  const [selectKeys, setSelectKeys] = useState([]);
  const unLinkedTotal = unLinkedObj.total || 0;

  const columns = [{
    title: '标题',
    dataIndex: 'name',
    width: '350px',
    render: (text) => {
      return (<span>
        <EpIcon type="requirement" className="u-mgr5" />
        <TextOverFlow content={text} maxWidth={'300px'} />
      </span>);
    }
  }, {
    title: '状态',
    dataIndex: 'state',
    width: '200px',
    render: (text) => {
      return <DefineDot
        text={text}
        statusMap={requirementNameMap}
        statusColor={requirementColorDotMap}
      />;
    }
  }, {
    title: '负责人',
    dataIndex: 'responseUser',
    width: '120px',
    render: (text) => {
      return text.name || '-';
    }
  }];

  const getUnLinkedListFun = () => {
    const params = {
      ...filterObj,
      limit: 10,
      offset: ((filterObj.current || 1) - 1) * 10,
      productId: productid,
    };
    getUnLinkedList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      setUnlinkedObj(res.result || {});
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  useDeepCompareEffect(() => {
    if (Object.keys(filterObj).length) {
      getUnLinkedListFun();
    }
  }, [filterObj]);

  const updateFilter = (key, value) => {
    if (key !== 'current') {
      setSelectKeys([]);
    }
    setFilterObj({
      ...filterObj,
      [key]: value,
    });
  };

  const handleOk = () => {
    const params = {
      parentIssueId,
      issueIdList: selectKeys,
      issueType: connTypeMap.requirement,
      parentIssueType: connTypeMap.objective,
    };
    issueRelationAdd(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('已成功添加');
      getPlanList();
      setVisible(false);
      setSelectKeys([]);
      setFilterObj({});
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const handleCancel = () => {
    setVisible(false);
    setSelectKeys([]);
    setFilterObj({});
  };

  return (<span onClick={e => e.stopPropagation()}>
    <a onClick={(e) => { e.stopPropagation(); setVisible(true); getUnLinkedListFun() }} className="u-mgl10">添加需求</a>
    <Modal
      title="添加需求"
      visible={visible}
      onCancel={() => {
        handleCancel();
      }}
      width={800}
      destroyOnClose
      footer={<span>
        <Button className="u-mgr10" onClick={() => { handleCancel() }}>取消</Button>
        <Button type="primary" onClick={() => handleOk()} disabled={!selectKeys.length}>确定({selectKeys.length})</Button>
      </span>}
    >
      <TwoColumnsQuery updateFilter={updateFilter} />
      <Table
        rowKey={record => record.id}
        className="u-mgt10"
        columns={columns}
        dataSource={unLinkedObj.list || []}
        rowSelection={{
          selectedRowKeys: selectKeys,
          onChange: (value) => setSelectKeys(value)
        }}
        pagination={{
          pageSize: 10,
          current: filterObj.current,
          onChange: value => updateFilter('current', value),
          defaultCurrent: 1,
          total: unLinkedTotal
        }}
      />
    </Modal>
  </span>);
}

export default AddUninkedRequirement;
