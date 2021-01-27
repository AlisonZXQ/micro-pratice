import React, { useCallback } from 'react';
import { message, Spin, Empty } from 'antd';
import EpIcon from '@components/EpIcon';
import EditTitle from '@components/EditTitle';
import EditStatusObjective from '@pages/receipt/components/drawer_shared/objective/EditStatus';
import MyIcon from '@components/MyIcon';
import { updateObjective } from '@services/objective';
import CreateRequirement from '@pages/receipt/components/create_requirement';
import Progress from '@components/CustomAntd/progress';
import { REQUIREMENT_STATUS_MAP } from '@shared/RequirementConfig';
import { drawerDelayFun } from '@utils/helper';
import CreateObjective from '../../create_objective';
import PlanMap from '../../plan_map';
import { getEditTitle } from './PlanListFun';
import AddUnlinkedRequirement from './AddUnlinkedRequirement';
import styles from '../index.less';

function OneColumns(props) {
  const { planList, getPlanList, setColumns, productid, planListLoading, getPlanOrDateList } = props;

  const columns = [{
    title: '目标名称',
    dataIndex: 'name',
    width: '20vw',
    render: (text, record) => {
      return <span>
        <span className="u-mgr5" style={{ position: 'relative', top: '-3px' }}>
          <EpIcon type={"objective"} />
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            drawerDelayFun(() => {
              props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `${record.issueKey}` });
            }, 200);
          }}
        >
          <EditTitle
            title={<a>{text}</a>}
            issueRole={record.issueRole}
            handleSave={(value) => handleUpdateObjective('name', value, record)}
            titleStyle={getEditTitle()}
            hoverShow
            maxWidth={'16vw'}
          />
        </span>
      </span>;
    }
  }, {
    title: '状态',
    dataIndex: 'state',
    width: '8vw',
    render: (text, record) => {
      return (<span style={{ position: 'relative', top: '-8px' }}>
        <EditStatusObjective
          issueRole={record.issueRole}
          value={text}
          bgHover={false}
          planListDetail={record}
          refreshFun={getPlanList}
        />
      </span>);
    }
  }, {
    title: '进度',
    dataIndex: 'progress',
    width: '13vw',
    render: (text, record) => {
      const children = record.children || [];
      const close = children.filter(it => it.state === REQUIREMENT_STATUS_MAP.CLOSE);
      return <Progress
        percent={children.length ? close.length / children.length * 100 : 0}
        style={{ width: '10vw' }}
        size="small"
        status={"active"}
        format={(percent, successPercent) => `${percent.toFixed(2)}%`}
      />;
    }
  }, {
    title: '负责人',
    dataIndex: 'fuzeren',
    width: '10vw',
    render: (text, record) => {
      const responseUser = record.responseUser || {};
      return responseUser.name;
    }
  }, {
    title: '预计上线时间',
    dataIndex: 'expectReleaseTime',
    width: '10vw',
    render: (text, record) => {
      return text || '-';
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    width: '18vw',
    render: (text, record) => {
      return <span>
        <CreateRequirement
          parentIssueId={record.id}
          refreshFun={props.refreshFun}
          productid={productid}
          trigger={<a>创建需求</a>}
        />
        <AddUnlinkedRequirement
          productid={productid}
          parentIssueId={record.id}
          getPlanList={getPlanList}
        />
        <PlanMap data={record} className="u-mgl10" />
      </span>;
    }
  }];

  // 更新目标
  const handleUpdateObjective = useCallback((type, value, record) => {
    const params = {
      id: record.id,
      [type]: value,
    };
    let promise = null;
    if (type === 'name') {
      promise = updateObjective(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      getPlanList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, [getPlanList]);

  const getTitle = () => {
    return columns.map(it =>
      <div className="f-ib" style={{ width: it.width }}>{it.title}</div>);
  };

  const getContent = () => {
    return planList.length ? planList.map(item =>
      <div
        className={styles.item}
        onClick={() => {
          props.dispatch({ type: 'requirementPlan/saveJumpId', payload: item.id });
        }}
      >
        {
          columns.map(it =>
            <div className="f-ib" style={{ width: it.width }}>
              {it.render(item[it.dataIndex], item)}
            </div>)
        }
      </div>
    )
      :
      <Empty className={styles.empty}>
        <CreateObjective
          refreshFun={({ id }) => {
            getPlanOrDateList();
            props.dispatch({ type: 'requirementPlan/saveJumpId', payload: id });
          }}
          productId={productid}
        />
      </Empty>;
  };

  return (<div className={styles.oneColumnsContainer}>
    <Spin spinning={planListLoading}>
      <div className={styles.body}>
        <div className={styles.title}>{getTitle()}</div>
        <div className={styles.content}>{getContent()}</div>
      </div>
    </Spin>

    <div
      className={styles.rightLine}
      onClick={() => {
        setColumns('twoColumns');
        localStorage.setItem('requirement_plan_collapse', 'twoColumns');
      }}
    >
      <div className={styles.icon}>
        <MyIcon
          type="icon-zhankaijiantou"
          className={styles.iconLeft}
        />
      </div>
    </div>
  </div>);
}

export default OneColumns;
