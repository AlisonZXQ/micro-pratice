import React, { useState, useEffect } from 'react';
import { message, Spin, Popover, Empty } from 'antd';
import { dboxTypeArr, dboxProjectType, pictureTypeArr } from '@shared/CommonConfig';
import MyIcon from '@components/MyIcon';
import { recentUpload, ownProject, ownProjectModule, fileByProject, ownTeam, fileByTeam } from '@services/receipt';
import styles from '../index.less';
// import uuid from 'uuid';

// const mockNearData = [
//   {id: uuid(), name: '最近上传1', ext: '', url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
//   {id: uuid(), name: '最近上传2', ext: 'png', url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
//   {id: uuid(), name: '最近上传3', ext: 'png', url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
// ];

// const mockTeam = [
//   {id: uuid(), name: '团队1'},
//   {id: uuid(), name: '团队2'},
//   {id: uuid(), name: '团队3'},
// ];

// const mockTeamChild = [
//   {id: uuid(), name: '空间1', ext: '', isDir: true, url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
//   {id: uuid(), name: '空间2', ext: '', isDir: false, url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
//   {id: uuid(), name: '空间3', ext: '', isDir: true, url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
//   {id: uuid(), name: '空间4', ext: '', isDir: false, url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
//   {id: uuid(), name: '空间5', ext: '', isDir: false, url: 'http://axure.yixin.im/api/resource/visionDownload?vid=459180785474162688'},
// ];

function Dbox(props) {
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(false);
  const [nearData, setNearData] = useState([[]]);
  const [nSelectKey, setNSelectKey] = useState([]);
  const [projectData, setProjectData] = useState([[]]);
  const [pSelectKey, setPSelectKey] = useState([]);
  const [teamData, setTeamData] = useState([[]]);
  const [tSelectKey, setTSelectKey] = useState([]);

  const { dboxData } = props;

  useEffect(() => {
    getInitData();
  }, []);


  const getInitData = () => {
    const sessionActive = sessionStorage.getItem('dboxActive');
    const active = sessionActive ? JSON.parse(sessionActive) : null;
    if(active) {
      setActive(active);
      const data = JSON.parse(sessionStorage.getItem('dboxData'));
      const key = JSON.parse(sessionStorage.getItem('dboxSelect'));
      if(active === 'project') {
        setProjectData(data);
        setPSelectKey(key);
      }else if(active === 'team') {
        setTeamData(data);
        setTSelectKey(key);
      }else if(active === 'near') {
        setNearData(data);
        setNSelectKey(key);
      }
    }else {
      setActive('near');
      getRecentUpload();
      sessionStorage.setItem('dboxActive', JSON.stringify('near'));
    }
  };

  const handleSetProject = (data) => {
    setProjectData(data);
    sessionStorage.setItem('dboxData', JSON.stringify(data));
  };

  const handleSetTeam = (data) => {
    setTeamData(data);
    sessionStorage.setItem('dboxData', JSON.stringify(data));
  };

  const handleSetNSelect = (data) => {
    setNSelectKey(data);
    sessionStorage.setItem('dboxSelect', JSON.stringify(data));
  };

  const handleSetPSelect = (data) => {
    setPSelectKey(data);
    sessionStorage.setItem('dboxSelect', JSON.stringify(data));
  };

  const handleSetTSelect = (data) => {
    setTSelectKey(data);
    sessionStorage.setItem('dboxSelect', JSON.stringify(data));
  };

  const getRecentUpload = () => { //最近上传
    setLoading(true);
    recentUpload().then((res) => {
      if (res.code !== 200) return message.error(`获取数据失败，${res.msg}`);
      let arr = [ res.result ];
      // let arr = [ mockNearData ];
      setNearData(arr);
      sessionStorage.setItem('dboxData', JSON.stringify(arr));
      setLoading(false);
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  };

  const getProjectList = () => { //项目空间(1)
    setLoading(true);
    ownProject().then((res) => {
      if (res.code !== 200) return message.error(`获取数据失败，${res.msg}`);
      handleSetProject([addLevelKey(res.result, 1)]);
      setLoading(false);
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  };

  const getOwnProjectModule = (pid) => { //项目下模块(2)
    setLoading(true);
    ownProjectModule(pid).then((res) => {
      if (res.code !== 200) return message.error(`获取数据失败，${res.msg}`);
      let arr = [projectData[0]];
      arr.push(addLevelKey(res.result, 2));
      handleSetProject(arr);
      setLoading(false);
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  };

  const getProjectType = () => { //模块下类型(3)
    const ThreeData = dboxProjectType;
    let arr = [];
    for(let i = 0; i < 2; i++) {
      arr.push(projectData[i]);
    }
    if(ThreeData.length) {
      arr.push(addLevelKey(ThreeData, 3));
    }
    handleSetProject(arr);
  };

  const getFileByProject = (type) => { //项目下的文件(4)
    setLoading(true);
    const pid = pSelectKey[0].id;
    const mid = pSelectKey[1].id;
    const params = {
      pid,
      mid,
      type,
      offset: 0,
      limit: 100,
    };
    fileByProject(params).then((res) => {
      if (res.code !== 200) return message.error(`获取数据失败，${res.msg}`);
      let arr = [];
      for(let i = 0; i < 3; i++) {
        arr.push(projectData[i]);
      }
      arr.push(addLevelKey(res.result, 4));
      handleSetProject(arr);
      setLoading(false);
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  };

  const getTeamList = () => { //团队空间
    setLoading(true);
    ownTeam().then((res) => {
      if (res.code !== 200) return message.error(`获取数据失败，${res.msg}`);
      handleSetTeam([addLevelKey(res.result, 1)]);
      // handleSetTeam([addLevelKey(mockTeam, 1)]);
      setLoading(false);
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  };

  const getOwnTeamData = (item) => { //团队下的文件
    let params = {};
    if(item.column === 1) {
      params = {
        tid: item.id,
        offset: 0,
        limit: 100,
      };
    }else {
      params = {
        tid: tSelectKey[0].id,
        id: item.id,
        offset: 0,
        limit: 100,
      };
    }
    setLoading(true);
    fileByTeam(params).then((res) => {
      if (res.code !== 200) return message.error(`获取数据失败，${res.msg}`);
      let arr = [];
      for(let i = 0; i < item.column; i++) {
        arr.push(teamData[i]);
      }
      arr.push(addLevelKey(res.result, item.column+1));
      handleSetTeam(arr);
      setLoading(false);
      //始终滚动到最右侧
      const dom = document.getElementById('teamspace');
      dom.scrollLeft = dom.scrollWidth;
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
    // let arr = [];
    // for(let i = 0; i < item.column; i++) {
    //   arr.push(teamData[i]);
    // }
    // arr.push(addLevelKey(mockTeamChild, item.column+1));
    // handleSetTeam(arr);
    // setLoading(false);
    //始终滚动到最右侧
    const dom = document.getElementById('teamspace');
    dom.scrollLeft = dom.scrollWidth;
  };

  const addLevelKey = (data, column) => {
    let arr = [];
    data && data.map(it => {
      arr.push({
        ...it,
        column: column
      });
    });
    return arr;
  };

  const isActiveProject = (it) => {
    return (pSelectKey[it.column-1] && pSelectKey[it.column-1].id === it.id) ||
      (!!dboxData.length && dboxData.find(item => item.id === it.id));
  };

  const getPdataItem = (data) => {
    const lastKey = (data && data[0] && data[0].column === 4) || data.length === 0;
    return <div className={`${lastKey ? styles.bigSpaceItem : styles.spaceItem}`}>
      {!data.length && <Empty className='u-mgt20' />}
      {data.map(it => (
        <div
          onClick={() => getPdataChild(it)}
          className={`${isActiveProject(it) ? styles.activeItem : styles.item} f-aic`}>
          {lastKey && pictureTypeArr.indexOf(it.ext) === -1 ?
            <MyIcon type='icon-bianzu' className='u-mgr5' style={{ fontSize: '24px' }} /> :
            lastKey && pictureTypeArr.indexOf(it.ext) > -1 ?
              <img className={styles.picture} src={it.url} alt='pic' /> : ''
          }
          <div className={`${styles.name} f-toe`}>
            <Popover placement="topLeft" content={it.name}>
              {it.name}
            </Popover>
          </div>
          {
            lastKey && isActiveProject(it) &&
            <span className={styles.lastIcon}>
              <MyIcon type='icon-xuanzhong1' />
            </span>
          }
        </div>
      ))}
    </div>;
  };

  const getPdataChild = (item) => {
    if(item.column === 1) {
      getOwnProjectModule(item.id);
      let arr = [];
      arr.push(item);
      handleSetPSelect(arr);
    }else if(item.column === 2) {
      getProjectType();
      let arr = [pSelectKey[0]];
      arr.push(item);
      handleSetPSelect(arr);
    }else if(item.column === 3) {
      getFileByProject(item.id);
      let arr = [pSelectKey[0], pSelectKey[1]];
      arr.push(item);
      handleSetPSelect(arr);
    }else if(item.column === 4) {
      let arr = [pSelectKey[0], pSelectKey[1], pSelectKey[2]];
      if(pSelectKey[3] && pSelectKey[3].id !== item.id) {
        arr.push(item);
        handleSetPSelect(arr);
      }

      let newArr = pushDboxData(item);
      props.setDboxData(newArr);
    }
  };

  const getSuffixIcon = (it) => {
    if(it.isDir) {
      return <MyIcon type='icon-wenjianjia' className='u-mgr5' style={{ fontSize: '24px' }} />;
    }else {
      return <MyIcon type='icon-bianzu' className='u-mgr5' style={{ fontSize: '24px' }} />;
    }
  };

  const isActiveTeam = (it) => {
    return (tSelectKey[it.column-1] && tSelectKey[it.column-1].id === it.id && tSelectKey[it.column-1].column === it.column) ||
      (!!dboxData.length && dboxData.find(item => item.id === it.id));
  };

  const getTdataItem = (data) => {
    const lastKey = (data && data[0] && data[0].column > 1) || data.length === 0;
    return <div className={`${lastKey ? styles.bigSpaceItem : styles.spaceItem}`}>
      {!data.length && <Empty className='u-mgt20' />}
      {data.map(it => (
        <div
          onClick={() => getTdataChild(it)}
          className={`${isActiveTeam(it) ? styles.activeItem : styles.item} f-aic`}>
          {it.column >= 2 && pictureTypeArr.indexOf(it.ext) === -1 ?
            getSuffixIcon(it) :
            it.column >= 2 && pictureTypeArr.indexOf(it.ext) > -1 ?
              <img className={styles.picture} src={it.url} alt='pic' /> : ''
          }
          <div className={`${styles.name} f-toe`}>
            <Popover placement="topLeft" content={it.name}>
              {it.name}
            </Popover>
          </div>
          {
            it.column >= 2 && isActiveTeam(it) && !it.isDir &&
            <span className={styles.lastIcon}>
              <MyIcon type='icon-xuanzhong1' />
            </span>
          }
        </div>
      ))}
    </div>;
  };

  const getTdataChild = (item) => {
    if(item.column === 1) {
      getOwnTeamData(item);
      let arr = [];
      arr.push(item);
      handleSetTSelect(arr);
    }else {
      let arr = [];
      for(let i = 0; i < item.column - 1; i++) {
        arr.push(tSelectKey[i]);
      }
      handleSetTSelect(arr);

      if(item.isDir) {
        getOwnTeamData(item);
      } else {
        let arr = [];
        for(let i = 0; i < item.column; i++) {
          arr.push(teamData[i]);
          handleSetTeam(arr);
        }

        let newArr = pushDboxData(item);
        props.setDboxData(newArr);
      }
    }
  };

  const clearSelectKey = () => {
    handleSetNSelect([]);
    handleSetPSelect([]);
    handleSetTSelect([]);
    props.setDboxData([]);
  };

  const handleChangeMenu = (value) => {
    setActive(value);
    sessionStorage.setItem('dboxActive', JSON.stringify(value));
    clearSelectKey();
    if(value === 'near') {
      getRecentUpload();
    }else if(value === 'project') {
      getProjectList();
    }else if(value === 'team') {
      getTeamList();
    }
  };

  const refresh = () => {
    setActive('near');
    getRecentUpload();
    handleSetProject([[]]);
    handleSetTeam([[]]);
    clearSelectKey();
  };

  const handleSelectNear = (it) => {
    let newArr = pushDboxData(it);
    handleSetNSelect(newArr);
    props.setDboxData(newArr);
  };

  const pushDboxData = (it) => {
    let arr = [...dboxData];
    let Index = arr.findIndex(item => item.id === it.id);
    if(Index > -1) {
      arr.splice(Index, 1);
    }else {
      arr.push(it);
    }
    return arr;
  };

  const isActiveNear = (it) => {
    return !!dboxData.length && dboxData.find(item => item.id === it.id);
  };

  return <Spin spinning={loading}>
    <span className={styles.dbox}>
      <span onClick={() => refresh()} className={styles.refresh}>
        <MyIcon type='icon-shuaxin' className='f-csp' />
      </span>
      <div className={styles.left}>
        {dboxTypeArr.map(it => (
          <span
            onClick={() => handleChangeMenu(it.value)}
            className={it.value === active ? styles.activeItem : styles.item}>
            {it.label}
          </span>
        ))}
      </div>

      <div className={styles.right} id='teamspace'>
        {active === 'near' && <span className={styles.near}>
          {!nearData[0].length && <Empty className='u-mgt20' />}
          {nearData[0].map(it => (
            <div
              onClick={() => handleSelectNear(it)}
              className={`${isActiveNear(it) ? styles.activeNearItem : styles.nearItem} f-aic`}>
              {pictureTypeArr.indexOf(it.ext) === -1 ?
                <MyIcon type='icon-bianzu' className='u-mgr5' style={{ fontSize: '24px' }} /> :
                <img className={styles.picture} src={it.url} alt='pic' />
              }
              <span className={`${styles.name} f-toe`}>
                <Popover placement="topLeft" content={it.name}>
                  {it.name}
                </Popover>
              </span>
              {isActiveNear(it) && <span className={styles.lastIcon}>
                <MyIcon type='icon-xuanzhong1' />
              </span>}
            </div>
          ))}
        </span>}

        {active === 'project' && <span className={styles.space}>
          {projectData.map((pdata) => (
            getPdataItem(pdata)
          ))}
        </span>}

        {active === 'team' && <span className={styles.space}>
          {teamData.map((tdata) => (
            getTdataItem(tdata)
          ))}
        </span>}
      </div>
    </span>
  </Spin>;
}

export default Dbox;
