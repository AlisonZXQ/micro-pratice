import React, { useCallback, useState, useEffect } from 'react';
import { Table, message, Button } from 'antd';
import { deleteModal } from '@shared/CommonFun';
import { deleteDismantle, getDismantleData } from '@services/product_setting';
import PlanForm from './PlanForm';

function DisplayAllPlans(props) {
  const { productid, setCurrentPlan, setCurrentDisplay } = props;
  const [planList, setPlanList] = useState([]);
  const [loading, setLoading] = useState([]);

  const getPlanList = useCallback(() => {
    setLoading(true);
    const params = {
      productid,
    };
    getDismantleData(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取信息失败, ${res.msg}`);
      }
      setPlanList(res.result || []);
      setLoading(false);
    }).catch((err) => {
      return message.error('获取信息异常', err || err.msg);
    });
  }, [productid]);

  useEffect(() => {
    getPlanList();
  }, [productid]);

  const columns = [
    {
      title: '方案名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      dataIndex: 'operator',
      width: 200,
      render: (text, record) => {
        return (<div>
          {/* <PlanForm
            trigger={<a>编辑</a>}
            record={record}
            type="edit"
            getPlanList={getPlanList}
          /> */}
          <a className='delColor' onClick={(e) => { e.stopPropagation(); handleDelete(record) }}>删除</a>
        </div >);
      }
    },
  ];

  const handleDelete = (item) => {
    const params = {
      id: item.id,
    };
    deleteModal({
      title: `您确认删除拆分方案【${item.name}】吗?`,
      okCallback: () => {
        deleteDismantle(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`删除失败, ${res.msg}`);
          }
          message.success('删除成功');
          getPlanList();
        }).catch((err) => {
          return message.error('删除异常', err || err.msg);
        });
      }
    });
  };

  return (<div className="u-mg15" style={{ marginTop: '0px' }}>
    <div className='bbTitle f-jcsb-aic'>
      <span className='name'>拆单方案</span>
      <span>
        <PlanForm
          trigger={<Button type="primary">创建方案</Button>}
          type="create"
          getPlanList={getPlanList}
          productid={productid}
        />
      </span>
    </div>
    <div className='bgWhiteModel' style={{ padding: '16px' }}>
      <Table
        columns={columns}
        dataSource={planList}
        onRow={(record) => {
          return {
            className: 'f-csp',
            onClick: () => {
              setCurrentPlan(record);
              setCurrentDisplay('detail');
            }
          };
        }}
        pagination={false}
        loading={loading}
      />
    </div>
  </div>);
}

export default DisplayAllPlans;
