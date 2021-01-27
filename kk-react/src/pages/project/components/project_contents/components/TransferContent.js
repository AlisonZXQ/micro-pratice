import React, { Component } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  Popover,
  Button,
  Input,
  Row,
  Col,
  Card,
  Checkbox,
  Pagination,
  message,
  Spin,
} from 'antd';
import debounce from 'lodash/debounce';
import { arrDeduplication } from '@utils/helper';
import JiraIcon from '@components/JiraIcon';
import EpIcon from '@components/EpIcon';
import { queryJiraList } from '@services/project';
import DefineDot from '@components/DefineDot';
import FilterSelect from '@components/FilterSelect';
import { jiraStatusMap, PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import QueryArea from './QueryArea';
import styles from '../index.less';

const { Search } = Input;
const CheckboxGroup = Checkbox.Group;

class TransferContents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      leftKeys: [],
      leftData: [],
      rightKeys: [],
      rightData: [],
      filterObjLeft: {},
      filterObjRight: {},
      pageNo: 1,
      pageSize: 100,
      total: 0,
      loading: false,
      checkAllLeft: false,
      checkAllRight: false,
      selectProduct: [], // 视觉更改后该值是一个数组
    };
    this.updateFilterLeft = debounce(this.updateFilterLeft, 800);
  }

  componentDidMount() {
    // 视觉改版后productId是个数组
    const arr = this.getDefaultProduct();
    if (arr && arr.length) {
      this.setState({ selectProduct: arr }, () => this.getDefaultData());
    } else {
      this.getDefaultData();
    }
  }

  getDefaultProduct = () => {
    const { projectBasic } = this.props;
    // 先从sessionStorage中取，没有的话带上当前项目关联的产品
    const projectProduct = projectBasic.products && projectBasic.products[0] && projectBasic.products[0].id;
    // 视觉改版后productId是个数组
    let sessionProduct = sessionStorage.getItem('productId') || '';
    let productArr = sessionProduct.length ? sessionProduct.split(',') : [];
    let arr = []; // 存在sessionStorage里面的而且在productByUser还能找到
    const { productByUser } = this.props;

    if (productArr && productArr.length && productByUser) {
      productArr.forEach(it => {
        const id = Number(it);
        if (productByUser.some(item => item.id === id)) {
          arr.push(id);
        }
      });
    } else if (projectProduct){
      arr.push(projectProduct);
    }
    return arr;
  }

  getDefaultData = () => {
    const { dataType, projectContents, mileContents, create, hasSelectContents } = this.props;
    if (dataType === 'all') {
      this.props.handleItems(projectContents);
      this.setState({
        rightData: [...projectContents],
      }, () => {
        this.getData();
      });
    }

    if (dataType === 'part') {
      this.props.handleItems(mileContents);
      const defaultRightdata = [...mileContents] || [];
      let arr = [...projectContents];

      // 创建项目->创建里程碑时需要过滤掉已经被选择的单据
      if (create && hasSelectContents && hasSelectContents.length) {
        arr = projectContents.filter(it => !hasSelectContents.some(item => item.issueKey === it.issueKey));
        arr = arr.concat([...mileContents]);
      }

      // 针对已经保存/未保存的里程碑关联内容编辑
      const newarr = [];
      arr.forEach(it => {
        if (!newarr.some(item => item.issueKey === it.issueKey)) {
          newarr.push(it);
        }
      });

      this.setState({
        dataSource: newarr,
        rightData: defaultRightdata,
      }, () => this.getUpdateLeftData(defaultRightdata));
    }
  }

  getData = () => {
    this.setState({
      pageNo: 1,
      dataSource: []
    }, () => this.getQueryData());
  };

  getQueryData = () => {
    const { filterObjLeft, pageNo, pageSize, selectProduct } = this.state;
    const { productByUser, projectBasic, productList } = this.props;
    const datasourceCreate = productList && productList[0] && productList[0].datasource;
    const datasourceHome = projectBasic && projectBasic.projectDetail && projectBasic.projectDetail.datasource;

    const filters = {};
    for (let i in filterObjLeft) {
      if (filterObjLeft[i] && filterObjLeft[i].length) {
        filters[i] = filterObjLeft[i];
      }
    }
    const params = {
      ...filters,
      productList: !selectProduct.length ? productByUser && productByUser.map(it => it.id) : selectProduct,
      pageNo,
      pageSize,
      datasource: datasourceCreate || datasourceHome, // 数据源标记位 1EP，2JIRA
    };
    const { rightData } = this.state;
    this.setState({ loading: true });

    if (productByUser && productByUser.length) {
      queryJiraList(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(res.msg);

        // 因为单据过滤的原因，datasource每次需要将后边的concat一下，保证左移动以后存在
        const newDataSource = res.result.list;
        rightData.forEach(it => {
          if (!newDataSource.some(item => item.issueKey === it.issueKey)) {
            newDataSource.push(it);
          }
        });
        this.setState({
          dataSource: newDataSource,
          total: res.result.total,
        }, () => this.getUpdateLeftData(rightData));

      }).catch((err) => {
        this.setState({ loading: false });
        return message.error('查询单据异常', err || err.message);
      });
    }
  }

  // 如果在右边有的数据，左边有需要过滤掉
  getUpdateLeftData = (rightData) => {
    const { dataSource } = this.state;
    const newLeftData = [...dataSource];
    if (rightData.length) {
      rightData.map(item => {
        if (newLeftData.some((it, index) => it.issueKey === item.issueKey)) {
          newLeftData.splice(newLeftData.findIndex(i => i.issueKey === item.issueKey), 1);
        }
      });
    }

    this.setState({
      leftData: newLeftData,
      rightData,
    });
  }

  // 对已选择的key列表进行递归选择key
  getFilterKeys = (keys) => {
    const { dataSource } = this.state;
    const newKeys = keys;
    const deepKey = (it) => {
      dataSource.forEach((item, index) => {
        if (item.parentKey === it) {
          const obj = item || {};
          newKeys.push(obj.issueKey);
          deepKey(obj.issueKey);
        }
      });
    };
    keys.map(it => deepKey(it));
    return arrDeduplication(newKeys);
  }

  handleToRight = () => {
    const { leftKeys, rightKeys, rightData, leftData } = this.state;
    const newRightData = rightData;
    const filterLeftKeys = this.getFilterKeys(leftKeys);
    filterLeftKeys.map((item) => {
      if (!rightData.some(it => it.issueKey === item)) { //目前看来是没必要的 ，因为是必定的对于每一个元素来说，右边有的左边没有
        newRightData.push(leftData.find(i => i.issueKey === item));
      }
    });

    this.getUpdateLeftData(newRightData);
    this.props.handleItems(newRightData);
    this.props.handleKeys([]);
    this.setState({
      rightData: newRightData,
      leftKeys: [],
      rightKeys,
      checkAllLeft: false,
    });
  }

  handleToLeft = () => {
    const { leftKeys, rightKeys, rightData } = this.state;
    const newRightData = rightData;

    // 移动子级对父级无影响，移动父级将移动所有的子级
    // getFilterKeys是为了找到所有的子级设定的函数
    const filterRightKeys = this.getFilterKeys(rightKeys);

    filterRightKeys.map(item => {
      newRightData.splice(rightData.findIndex(i => i.issueKey === item), 1);
    });

    this.props.handleItems(newRightData);
    this.props.handleKeys([]);
    this.getUpdateLeftData(newRightData);
    this.setState({
      rightData: newRightData,
      rightKeys: [],
      leftKeys,
      checkAllRight: false,
    });
  }

  updateFilterLeft = (key, value) => {
    const { filterObjLeft } = this.state;
    const { dataType } = this.props;

    if (dataType === 'all') {
      const newObj = {
        ...filterObjLeft,
        [key]: value,
      };
      this.setState({
        filterObjLeft: newObj,
        pageNo: 1,
        dataSource: [],
        key: this.state.key + 1,
        leftKeys: [],
      }, () => this.getQueryData());
    }
    this.setState({
      filterObjLeft: { ...this.state.filterObjLeft, [key]: value }
    });
  }

  updateFilterRight = (key, value) => {
    this.setState({
      filterObjRight: { ...this.state.filterObjRight, [key]: value },
      rightKeys: []
    });
  }

  handleSelectProduct = (arr) => {
    this.setState({ selectProduct: arr }, () => this.getQueryData());
    sessionStorage.setItem('productId', arr.join(','));
  }

  leftTitle = () => {
    const { dataType, productByUser } = this.props;
    const { leftData } = this.state;
    return (<div>
      <div className='f-jcsb-aic'>
        {
          dataType === 'all' ?
            <FilterSelect
              onChange={(value) => this.handleSelectProduct(value)}
              dataSource={(productByUser ? productByUser : []).map((it) => ({
                label: it.name, value: it.id,
              }))}
              defaultValue={this.getDefaultProduct()}
            />
            : <span>全部单据</span>
        }
        <span>共{this.state.total || leftData.length}条</span>
      </div>
    </div>);
  }

  rightTitle = () => {
    const { rightKeys, rightData } = this.state;
    return (<div className='f-jcsb-aic'>
      <span>
        当前项目
      </span>
      {
        !!rightKeys.length &&
        <span>{rightKeys.length}/{rightData.length}</span>
      }
    </div>);
  }

  handleLeftChange = (keys, data) => {
    const { leftData } = this.state;
    if (keys.length === leftData.length) {
      this.setState({ leftKeys: keys, checkAllLeft: true });
    } else {
      this.setState({ leftKeys: keys, checkAllLeft: false });
    }
    this.props.handleKeys(keys);
  }

  handleRightChange = (keys, data) => {
    const { rightData } = this.state;
    if (keys.length === rightData.length) {
      this.setState({ rightKeys: keys, checkAllRight: true });
    } else {
      this.setState({ rightKeys: keys, checkAllRight: false });
    }
    this.props.handleKeys(keys);
  }

  processData = (data, type) => {
    const { filterObjLeft, filterObjRight } = this.state;
    let filterObj = filterObjLeft;
    if (type === 'right') {
      filterObj = filterObjRight;
    }
    const { status, keyword, issueType } = filterObj;

    return data.filter(item => !status || !status.length || status.includes(item.status))
      .filter(item => !issueType || !issueType.length || issueType.includes(item.issuetype))
      .filter(item => !keyword || !keyword.length || item.summary.includes(keyword));
  }

  onChangePageLeft = (no) => {
    this.props.handleKeys([]);
    this.setState({ pageNo: no, leftKeys: [] }, () => this.getQueryData());
  }

  handleChangeAllRight = (e) => {
    const { rightData } = this.state;

    this.props.handleKeys(e.target.checked ? rightData.map(it => it.issueKey) : []);

    this.setState({ checkAllRight: e.target.checked });
    this.setState({
      rightKeys: e.target.checked ? rightData.map(it => it.issueKey) : [],
    });
  }

  handleChangeAllLeft = (e) => {
    const { leftData } = this.state;

    this.props.handleKeys(e.target.checked ? leftData.map(it => it.issueKey) : []);

    this.setState({ checkAllLeft: e.target.checked });
    this.setState({
      leftKeys: e.target.checked ? leftData.map(it => it.issueKey) : [],
    });
  }

  render() {
    const { dataType, issueCondition, productList, projectBasic} = this.props;
    const { leftKeys, rightKeys, rightData, leftData, checkAllLeft, checkAllRight } = this.state;
    const datasourceCreate = productList && productList[0] && productList[0].datasource;
    const datasourceHome = projectBasic && projectBasic.projectDetail && projectBasic.projectDetail.datasource;
    const datasource = datasourceCreate || datasourceHome; // 数据源标记位 1EP，2JIRA

    const dataDisplay = (data, type) => {
      // 右边的数据还是需要自己去筛选的
      let dataArr = [];
      if (dataType === 'all' && type === 'left') {
        dataArr = data;
      } else {
        dataArr = this.processData(data, type);
      }
      return (
        dataArr && dataArr.map((item) => ({
          label: <span>
            <Popover
              content={`${item.summary}`}
            >
              <span>
                <span className="u-mgr10 f-vam">
                  {datasource === PROJECT_DATASOURCE.EP ? <EpIcon type={item.issuetype} /> :
                    <JiraIcon type={item.issuetype} />
                  }

                </span>
                <span style={{ maxWidth: '30vw' }}
                  className={`f-ib f-toe ${styles.itemStyle}`}>
                  {item.parentKey && <span className="u-mgr10">{item.parentKey}/</span>}
                  {item.summary}
                </span>
              </span>
            </Popover>
            <span className='f-fr' style={{ width: '80px' }}>
              <DefineDot
                text={['开始', '重新打开', '关闭'].includes(item.status) ? item.status : '其他'}
                statusColor={jiraStatusMap}
                displayText={item.status}
              />
            </span>
          </span>,
          value: item.issueKey,
        })));
    };
    return (
      <Row className={styles.newTrans}>
        <Col span={11} className={styles.left}>
          <Card
            title={this.leftTitle()}
          >
            {
              <span>
                <Search
                  className={styles.search}
                  allowClear
                  placeholder="请输入搜索内容"
                  onChange={(e) => this.updateFilterLeft('keyword', e.target.value)}
                />
                <div className='u-mgt20'>
                  <QueryArea
                    updateFilter={this.updateFilterLeft}
                    issueTypes={issueCondition.issueTypes}
                    statuses={issueCondition.statuses}
                  />
                </div>
                {
                  <Spin spinning={this.state.loading}>
                    {
                      leftData.length ?
                        <span>
                          <Checkbox className={`u-mgt10 ${styles.transCheckbox}`} checked={checkAllLeft} onChange={(e) => this.handleChangeAllLeft(e)} />
                          <span style={{ marginLeft: '8px' }}>全选</span>
                          <div style={{ overflowY: 'auto', overflowX: 'hidden', height: 'calc( 100vh - 338px )' }}>
                            <CheckboxGroup
                              options={dataDisplay(leftData, 'left')}
                              onChange={this.handleLeftChange}
                              value={leftKeys}
                            />
                          </div>
                        </span>
                        : <span className={styles.emptyText} style={{ height: 'calc( 100vh - 288px )' }}>暂无数据</span>
                    }
                    <div>
                      <span className='f-fl' style={{marginTop: '26px'}}>本页已选{leftKeys.length}/{leftData.length}</span>
                      {
                        dataType === 'all' && this.state.total > 100 &&
                        <span className="u-mgt20 f-fr">
                          <Pagination
                            defaultCurrent={1}
                            total={this.state.total}
                            onChange={this.onChangePageLeft}
                            defaultPageSize={100}
                          />
                        </span>
                      }
                    </div>
                  </Spin>
                }
              </span>
            }
          </Card>
          {/* 先采用分页，瀑布流移动有问题 */}
        </Col>

        <Col span={2} className={styles.middle}>
          <Button
            className={`u-mgb10 ${styles.button}`}
            disabled={!leftKeys.length}
            onClick={() => this.handleToRight()}
          >
            <RightOutlined /></Button>
          <Button
            className={styles.button}
            disabled={!rightKeys.length}
            onClick={() => this.handleToLeft()}
          ><LeftOutlined /></Button>
        </Col>

        <Col span={11} className={styles.right}>
          <Card
            title={this.rightTitle()}
          >
            <Search
              className={styles.search}
              allowClear
              placeholder="请输入搜索内容"
              onChange={(e) => this.updateFilterRight('keyword', e.target.value)}
            />
            <div className='u-mgt20'>
              <QueryArea
                updateFilter={this.updateFilterRight}
                issueTypes={issueCondition.issueTypes}
                statuses={issueCondition.statuses}
              />
            </div>
            {
              rightData.length ?
                <div>
                  <Checkbox className={`u-mgt10 ${styles.transCheckbox}`} style={{ marginBottom: '10px' }} checked={checkAllRight} onChange={(e) => this.handleChangeAllRight(e)} />
                  <span style={{ marginLeft: '8px' }}>全选</span>
                  <div style={{ overflowY: 'auto', overflowX: 'hidden', height: 'calc( 100vh - 338px )' }}>
                    <CheckboxGroup
                      options={dataDisplay(rightData, 'right')}
                      onChange={this.handleRightChange}
                      value={rightKeys}
                    />
                  </div>
                </div> : <span className={styles.emptyText}>请从左侧选择添加</span>
            }
          </Card>
        </Col>
      </Row>
    );
  }
}

export default TransferContents;
