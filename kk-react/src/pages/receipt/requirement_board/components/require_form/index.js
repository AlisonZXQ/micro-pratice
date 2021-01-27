import React, { useState, useEffect } from 'react';
import { Checkbox, Pagination, message, Empty, Spin } from 'antd';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { getTotalCount, getRequirementList } from '@services/requirement';
import DefineDot from '@components/DefineDot';
import EpIcon from '@components/EpIcon';
import { requirementNameMap, requirementColorDotMap } from '@shared/CommonConfig';
import QueryArea from './components/QueryArea';
import styles from './index.less';

function Index(props) {
  const [checkList, setCheckList] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [updateObj, setUpdateObj] = useState({});
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const { productid } = props && props.location && props.location.query;

  useEffect(() => {
    getList();
  }, [current, updateObj]);

  useEffect(() => {
    props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: productid } });
    props.dispatch({ type: 'product/getAllUserByProductId', payload: { productId: productid } });
    setCheckList(props.issueIdList || []);
  }, []);

  const getList = () => {
    setLoading(true);
    const params = {
      ...updateObj,
      limit: 10,
      offset: (current - 1) * 10,
      productid: props.productid,
    };
    getTotalCount(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      setTotal(res.result);
    }).catch(err => {
      return message.error(err.message);
    });
    getRequirementList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      setList(res.result);
      setLoading(false);
    }).catch(err => {
      return message.error(err.message);
    });
  };

  const handleChangeChecked = (e) => {
    let newCheckList = checkList;
    const value = e.target.value;
    if (checkList.indexOf(value) > -1) {
      newCheckList.splice(checkList.indexOf(value), 1);
    } else {
      newCheckList.push(value);
    }
    setCheckList(newCheckList);
    props.updateCheckList(newCheckList);
  };

  const updateFilter = (key, value) => {
    const params = {
      ...updateObj,
      [key]: value,
    };
    if(params.id) {
      params.id = params.id.split('-')[1];
    }
    setCurrent(1);
    setUpdateObj(params);
  };

  const onPageChange = (current, pageSize) => {
    setCurrent(current);
  };

  const handleCheckedAll = (checked) => {
    let arr = [];
    if(checked) { //全选
      list.map(it => {
        if(checkList.indexOf(it.requirement.id) > -1) {
          return;
        }else {
          arr.push(it.requirement.id);
        }
      });
      const newArr = checkList.concat(arr);
      setCheckList(newArr);
      props.updateCheckList(newArr);
    }else { //全不选
      let newArr = [];
      checkList.map(it => {
        const index = list.findIndex( x => x.requirement.id === it);
        if(index === -1) {
          newArr.push(it);
        }
      });
      setCheckList(newArr);
      props.updateCheckList(newArr);
    }
  };

  const isCheckAll = () => {
    let checkAll = true;
    list.map(it => {
      if(checkList.indexOf(it.requirement.id) === -1) {
        checkAll = false;
      }
    });
    return checkAll;
  };
  return <span>
    <Spin spinning={loading}>
      <QueryArea
        subProductAll={props.subProductAll}
        allProductUser={props.allProductUser}
        productid={productid}
        updateFilter={updateFilter}
        parentParams={updateObj}
        type={props.type}
      />

      <div className={styles.tableHead}>
        <span className={styles.item} style={{ width: '60%' }}>
          <Checkbox
            onChange={(it) => handleCheckedAll(it.target.checked)}
            checked={isCheckAll()}
          ></Checkbox>
          <span style={{ marginLeft: '8px' }}>
            标题
          </span>
        </span>
        <span className={styles.item} style={{ width: '20%' }}>状态</span>
        <span className={styles.item} style={{ width: '20%' }}>负责人</span>
      </div>

      <div className={styles.tableContent}>
        {list && list.map(it => (
          <div className={styles.row}>
            <span className={styles.item} style={{ width: '60%' }}>
              <Checkbox
                key={it && it.requirement && it.requirement.id}
                value={it && it.requirement && it.requirement.id}
                checked={checkList.indexOf(it.requirement && it.requirement.id) > -1}
                onChange={(e) => handleChangeChecked(e)}>
                <EpIcon type='requirement' />
                <span className='u-mgl5'>
                  {it && it.requirement && it.requirement.name}
                </span>
              </Checkbox>
            </span>
            <span className={styles.item} style={{ width: '20%' }}>
              <DefineDot
                text={it && it.requirement && it.requirement.state}
                statusMap={requirementNameMap}
                statusColor={requirementColorDotMap}
              />
            </span>
            <span className={styles.item} style={{ width: '20%' }}>
              {it && it.responseUser && it.responseUser.realname}
            </span>
          </div>
        ))}
        {!list.length && <span className='u-mgt10 u-mgb10'>
          <Empty />
        </span>}
      </div>

      <div>
        <Pagination
          onChange={(current, pageSize) => onPageChange(current, pageSize)}
          defaultCurrent={1}
          current={current}
          total={total}
        />
      </div>
    </Spin>
  </span>;
}

const mapStateToProps = (state) => {
  return {
    subProductAll: state.product.enableSubProductList, // 产品下的所有子产品
    allProductUser: state.product.allProductUser, // 产品下的所有用户
  };
};

export default withRouter(connect(mapStateToProps)(Index));
