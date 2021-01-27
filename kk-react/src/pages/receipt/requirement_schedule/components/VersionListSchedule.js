import React, { useState, useCallback } from 'react';
import moment from 'moment';
import { Droppable } from 'react-beautiful-dnd';
import { CaretDownOutlined } from '@ant-design/icons';
import { Tag, Empty, Menu, message, Button } from 'antd';
import DropDown from '@components/CustomAntd/drop_down';
import { Link } from 'umi';
import { versionColor, versionMap, VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import CreateRequirement from '@pages/receipt/components/create_requirement';
import TextOverFlow from '@components/TextOverFlow';
import OpenVersion from '@pages/receipt/components/OpenVersion';
import PublishVersion from '@pages/receipt/components/publish_version';
import VersionForm from '@pages/receipt/components/VersionForm';
import { deleteModal } from '@shared/CommonFun';
import { deleteVersion } from '@services/version';
import { calculateDwm } from '@utils/helper';
import PopoverTip from '@components/PopoverTip';
import RateBar from './RateBar';
import { getDraggableContent, getTitle } from './CommonScheduleFun';
import styles from '../index.less';

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '', // @color-blue-1
  margin: '0px',
  width: '100%',
});

function VersionListSchedule(props, ref) {
  const { planVersionList, productid, subProductAll, getPlanVersionList, getRequirementPool,
    dispatch } = props;
  const [collapseObj, setCollapseObj] = useState({});

  const getCollaspeNum = useCallback(() => {
    let collaseNum = 0;
    for (let i in collapseObj) {
      if (collapseObj[i]) {
        collaseNum += 1;
      }
    }
    return collaseNum;
  }, [collapseObj]);

  const expandOrCollapseAllKeys = (flag) => {
    var newCollapseObj = {};
    planVersionList && planVersionList.forEach(it => {
      newCollapseObj[it.versionId] = flag;
    });
    setCollapseObj(newCollapseObj);
  };

  const getCommonPart = (it, collapseOrNot) => {
    return (
      <div
        onClick={() => setCollapseObj({
          ...collapseObj,
          [it.versionId]: collapseOrNot
        })}
        className={`${styles.firstLine} f-jcsb-aic f-csp`}
      >
        <span>
          <CaretDownOutlined
            className={collapseObj[it.versionId] ? styles.iconCollapse : styles.iconExpand} />
          <Tag color={versionColor[it.versionState]}>{versionMap[it.versionState]}</Tag>
          <TextOverFlow content={<span className={styles.versionTitle}>{it.versionName}</span>} maxWidth={'6vw'} />

          <span className={styles.versionEndTime}>计划发布日期：{it.versionEndTime ? moment(it.versionEndTime).format('YYYY-MM-DD') : '-'}</span>
        </span>
        <span>
          <span className="u-mgr10">
            <PopoverTip
              content={<span>
                当前版本排入需求数量：<span className="u-primary">{it.requirementCount4Current || 0}</span> / 历史统计版本吞吐量：<span className="u-primary">{it.requirementCount4History || 0}</span>
              </span>}
              trigger={
                <span>
                  <RateBar width={60} left={it.requirementCount4Current || 0} right={it.requirementCount4History || 0} icon={"icon-tuntuliang"} />
                </span>
              }
            />
          </span>
          <span className="u-mgr10">
            <PopoverTip
              content={<span>
                当前版本排入需求工作量：<span className="u-primary">{calculateDwm(it.capacity4Current || 0)}</span>人天 / 历史统计版本容量：<span className="u-primary">{calculateDwm(it.capacity4History || 0)}</span>人天
              </span>}
              trigger={
                <span>
                  <RateBar width={60} left={calculateDwm(it.capacity4Current || 0)} right={calculateDwm(it.capacity4History || 0)} icon={"icon-rongliang"} />
                </span>
              }
            />
          </span>
          <span>
            <DropDown overlay={getDropDownContents(it)} />
          </span>
        </span>
      </div>
    );
  };

  const handleDelete = (it) => {
    const params = {
      id: it.versionId,
    };

    deleteModal({
      title: '版本删除后不可恢复，版本中所有需求退回需求池',
      content: '确定要删除吗？',
      okCallback: () => {
        deleteVersion(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          getPlanVersionList();
          getRequirementPool();
        }).catch((err) => {
          return message.error(err || err.message);
        });
        message.success('版本已删除');
      }
    });
  };

  const getDropDownContents = (it) => {
    if (it.versionState === VERISON_STATUS_MAP.NEW) {
      return <Menu>
        <Menu.Item key={"open"}>
          <a>
            <OpenVersion
              trigger={<span type="primary">开启版本</span>}
              versionId={it.versionId}
              dueDate={it.versionEndTime}
              hasContent={it.hasContent}
              okCallback={() => {
                getPlanVersionList();
              }}
            />
          </a>
        </Menu.Item>
        <Menu.Item key={"enter"}>
          <Link to={`/manage/version/detail?versionid=${it.versionId}&productid=${productid}`} target="_blank">进入看版</Link>
        </Menu.Item>
        <Menu.Item key={"edit"}>
          <a>
            <VersionForm
              dispatch={dispatch}
              productId={productid}
              version={it}
              okCallback={(newVersionId) => {
                getPlanVersionList();
              }}
              edit
              trigger={<span>编辑版本</span>}
            />
          </a>
        </Menu.Item>
        <Menu.Item key={"delete"}>
          <a onClick={() => handleDelete(it)}>删除版本</a>
        </Menu.Item>
      </Menu>;
    } else if (it.versionState === VERISON_STATUS_MAP.OPEN) {
      return <Menu>
        <Menu.Item key={"publish"}>
          <PublishVersion
            trigger={<span type="primary">发布版本</span>}
            versionId={it.versionId}
            okCallback={() => {
              getPlanVersionList();
            }}
          />
        </Menu.Item>
        <Menu.Item key={"enter"}>
          <Link to={`/manage/version/detail?versionid=${it.versionId}&productid=${productid}`} target="_blank">进入看版</Link>
        </Menu.Item>
        <Menu.Item key={"edit"}>
          <a>
            <VersionForm
              dispatch={dispatch}
              productId={productid}
              version={it}
              okCallback={(newVersionId) => {
                getPlanVersionList();
              }}
              edit
              trigger={<span>编辑版本</span>}
            />
          </a>
        </Menu.Item>
      </Menu>;
    }
  };

  const getCollaspe = (it) => {
    return (
      <Droppable droppableId={`droppable-right-collapse-${it.versionId}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {getCommonPart(it, false)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  const getExpand = (it) => {
    return (<div key={`${it.versionId}`}>
      {getCommonPart(it, true)}
      <div className="f-jcsb-aic u-mgb10">
        <span className="u-mgl15">
          <TextOverFlow content={it.versionDescription || '--'} maxWidth={"30vw"} />
        </span>
        <CreateRequirement
          subProductId={it.subProductId}
          parentIssueId={0}
          refreshFun={() => getPlanVersionList()}
          productid={productid}
          fixversionid={it.versionId}
          trigger={<a>创建需求</a>}
          subProductNoChange
        />
      </div>
      <Droppable droppableId={`droppable-right-expand-${it.versionId}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            <div className={styles.title}>{getTitle('version')}</div>
            {it.content && it.content.length
              ? it.content.map((item, index) => (
                getDraggableContent(item, index, dispatch, 'version')
              ))
              :
              <Empty className="u-mgt10" />
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>);
  };

  return (<div className={styles.versionListSchedule}>
    <a className={`${styles.collapse} btn98`} onClick={() => {
      if (getCollaspeNum() === planVersionList.length) {
        expandOrCollapseAllKeys(false);
      } else {
        expandOrCollapseAllKeys(true);
      }
    }}>
      {
        getCollaspeNum() === planVersionList.length ?
          <Button>展开版本</Button> : <Button>收缩版本</Button>
      }
    </a>
    {
      planVersionList && planVersionList.map(it =>
        <div className={styles.card}>
          {
            collapseObj[it.versionId] ?
              getCollaspe(it)
              :
              getExpand(it)
          }
        </div>
      )
    }
    <VersionForm
      dispatch={dispatch}
      productId={productid}
      okCallback={(newVersionId) => {
        getPlanVersionList();
      }}
      subProductAll={subProductAll}
      create
      trigger={<Button type='dashed' className="f-fw">+ 创建版本</Button>}
    />
  </div>);
}

export default VersionListSchedule;
