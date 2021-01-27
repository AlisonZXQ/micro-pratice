import React, { Component } from 'react';
import { history } from 'umi';
import { Popover } from 'antd';
import MyIcon from '@components/MyIcon';
import { setCollapseObj, getCollapseObj, deepCopy } from '@utils/helper';

import { OPS_PM_PRODUCT_NAME } from '@shared/ReceiptConfig';
import { menuList, urlMap, issueDetailValueMap, receiptList, PRODUCT_MANAGE_MAP } from '@shared/LayoutConfig';
import ProductList from '../product_list';
import styles from './index.less';

class index extends Component {
  state = {
    value: '', //PRODUCT_MANAGE_MAP
    enterKey: 0,
    active: false,
    collapse: false,
    parentCollapseObj: {
      12: true //默认展开工作项二级菜单
    },
  };

  componentDidMount() {
    const { pathname } = this.props.location;
    this.getDefaultActiveValue(pathname);

    const defaultCollapse = getCollapseObj('sider');
    this.setState({ collapse: defaultCollapse });
    this.props.dispatch({ type: 'layout/saveCollapse', payload: defaultCollapse });
  }

  componentWillReceiveProps(nextProps) {
    const beforePathname = this.props.location.pathname;
    const nextPathname = nextProps.location.pathname;
    if (beforePathname !== nextPathname) {
      this.getDefaultActiveValue(nextPathname);
    }
  }

  getDefaultActiveValue = (pathname) => {
    if (pathname.includes('/report')) {
      this.setState({ value: PRODUCT_MANAGE_MAP.DATA_REPORT });
    }
    for (let i in issueDetailValueMap) {
      if (pathname.includes(i)) {
        this.setState({ value: issueDetailValueMap[i] });
      }
    }
  }

  handleJump = (key) => {
    const { lastProduct } = this.props;
    const id = lastProduct.id;
    if (id) {
      // 默认选择的子产品当前用户是否有权限
      this.props.dispatch({ type: 'product/getProductFlag', payload: { productId: id } });
      history.push(`${urlMap[key]}?productid=${id}`);
    } else {
      history.push(`${urlMap[key]}`);
    }
  }

  handleClick = (key) => {
    const receipt = [
      PRODUCT_MANAGE_MAP.ADVISE,
      PRODUCT_MANAGE_MAP.REQUIREMENT,
      PRODUCT_MANAGE_MAP.TASK,
      PRODUCT_MANAGE_MAP.BUG,
      PRODUCT_MANAGE_MAP.OBJECTIVE,
      PRODUCT_MANAGE_MAP.TICKET,
    ];
    if (receipt.indexOf(key) > -1) {
      const params = localStorage.getItem(`${receiptList[key]}ListQuery`) ? JSON.parse(localStorage.getItem(`${receiptList[key]}ListQuery`)) : {};
      const newParams = {
        ...params,
        offset: 0,
        limit: 10,
      };
      localStorage.setItem(`${receiptList[key]}ListQuery`, JSON.stringify(newParams));
    }
    this.setState({ value: key });
    this.handleJump(key);
  }

  sliderHover = (key) => {
    this.setState({ enterKey: key });
  }

  getUnCollapse = (it) => {
    const { value } = this.state;

    return (!it.children ?
      <a>
        <li
          key={it.key}
          className={`${it.key === value ? styles.liSelectStyle : styles.liStyle}`}
          onClick={() => { this.handleClick(it.key) }}
        >
          <MyIcon
            type={it.iconType}
            className={`${it.key === PRODUCT_MANAGE_MAP.BUG ? `f-fs5 ${styles.bugPosition}` : 'f-fs4'} ${styles.icon} ${styles.liPosition}`}
          />
          <span className={`u-mgl10 f-fs2 ${styles.name}`} style={it.key === PRODUCT_MANAGE_MAP.BUG ? { marginLeft: '8px' } : {}}>{it.name}</span>
          {
            it.key === value &&
            <span className={styles.arrow}>
              <MyIcon type="icon-cebianlanjiantou" />
            </span>
          }
        </li>
      </a>
      :
      this.unCollapseChildList(it)
    );
  }

  unCollapseItem = (it) => {
    const { parentCollapseObj, value } = this.state;

    return (<li
      key={it.key}
      style={{ marginBottom: '60px' }}
      className={it.children.find(item => item.key === value) ? styles.receiptLiActive : styles.receiptLi}
    >
      <div
        className={styles.parentDiv}
        onClick={() => {
          this.setState({
            parentCollapseObj: {
              ...parentCollapseObj,
              [it.key]: !parentCollapseObj[it.key],
            }
          });
        }}
      >
        <MyIcon
          type={it.iconType}
          className={`${'f-fs4'} ${styles.icon} ${styles.liPosition}`}
        />
        <span className={`u-mgl10 f-fs2 ${styles.name}`}>{it.name}</span>
        <span className='f-fr' style={{ marginRight: '12px' }}>
          <MyIcon
            type="icon-fanhuitubiao"
            className={`${parentCollapseObj[it.key] ? styles.up : styles.down} ${it.children.find(item => item.key === value) ? styles.enable : ''}`}
          />
        </span>
      </div>

      {
        parentCollapseObj[it.key] &&
        <span>
          {
            it.children.map(child =>
              <div
                className={child.key === value ? styles.childDivSelect : styles.childDiv}
                onClick={() => this.handleClick(child.key)}
              >
                {child.name}
              </div>)
          }
        </span>
      }
    </li>);
  }

  unCollapseChildList = (it) => {
    const { parentCollapseObj, value } = this.state;

    if(!parentCollapseObj[it.key]) {
      return <Popover overlayClassName={styles.noArraw} placement="rightTop" content={
        <div className={styles.showHoverDiv}>
          {it.children.map(item => (
            <div
              onClick={(e) => { e.stopPropagation(); this.handleClick(item.key) }}
              className={`${styles.hoverDivItem} ${item.key === value ? styles.currentActive : ''}`}>
              {item.name}
            </div>
          ))}
        </div>
      }>
        {this.unCollapseItem(it)}
      </Popover>;
    }else {
      return this.unCollapseItem(it);
    }

  }

  getCollapse = (it) => {
    const { value } = this.state;
    return (!it.children ? <div className={styles.sliderItem}>
      <a>
        <Popover content={it.name} placement='right'>
          <li key={it.key}
            onMouseEnter={() => this.sliderHover(it.key)}
            onMouseLeave={() => this.setState({ enterKey: 0 })}
            className={`${it.key === value ? styles.liSelectStyle : styles.liStyle} f-csp`}
            onClick={() => this.handleClick(it.key)}
          >
            <MyIcon
              type={it.iconType}
              className={`${it.key === PRODUCT_MANAGE_MAP.BUG ? `f-fs5 ${styles.bugPosition}` : 'f-fs4'} ${styles.icon} ${styles.liPosition}`}
            />
          </li>
        </Popover>
      </a>
    </div> : this.collapseChildList(it));
  }

  collapseChildList = (it) => {
    const { value } = this.state;

    return (<div>
      <Popover overlayClassName={styles.noArraw} placement="rightTop" content={<div
        className={styles.showHoverDiv}
      >
        {it.children.map(item => (
          <div
            onClick={() => this.handleClick(item.key)}
            className={item.key === value ? styles.activeDivItem : styles.hoverDivItem}>
            {item.name}
          </div>
        ))}
      </div>}>
        <div className={styles.sliderItem}>
          <a>
            <li key={it.key}
              className={`${it.children.find(item => item.key === value) ? styles.liSelectStyle : styles.liStyle} f-csp`}
            >
              <MyIcon
                type={it.iconType}
                className={`${it.key === PRODUCT_MANAGE_MAP.BUG ? `f-fs5 ${styles.bugPosition}` : 'f-fs4'} ${styles.icon} ${styles.liPosition}`}
              />
            </li>
          </a>
        </div>
      </Popover>
    </div>

    );
  }

  handleCollpse = (e) => {
    e.stopPropagation();
    setCollapseObj('sider', !this.state.collapse);
    this.setState({ collapse: !this.state.collapse });
    this.props.dispatch({ type: 'layout/saveCollapse', payload: !this.state.collapse });
  }

  getNeedShowMenuList = () => {
    const { lastProduct } = this.props;
    let filterMenuList = [];

    //TODO 永洲需求，特殊处理
    if (lastProduct.name === OPS_PM_PRODUCT_NAME) {
      const newMenuList = deepCopy(menuList, []);
      filterMenuList = newMenuList.filter(it => it.key !== PRODUCT_MANAGE_MAP.VERSION);
      filterMenuList.forEach(it => {
        if (it.children) {
          it.children = it.children.filter(item => item.key !== PRODUCT_MANAGE_MAP.ADVISE && item.key !== PRODUCT_MANAGE_MAP.BUG);
        }
      });
    // 只有管理员可以看到目标tab
    } else {
      const newMenuList = deepCopy(menuList, []);
      if (!lastProduct.productAdmin) {
        newMenuList.forEach(it => {
          if (it.children) {
            it.children = it.children.filter(item => item.key !== PRODUCT_MANAGE_MAP.OBJECTIVE);
          }
        });
      }
      filterMenuList = newMenuList;
    }
    return filterMenuList;
  }

  render() {
    const { productList, lastProduct } = this.props;
    const { collapse } = this.state;

    const filterMenuList = this.getNeedShowMenuList();

    return (
      <div className={!collapse ? styles.sider : styles.collapseSider}>
        {
          productList && !!productList.length && <ProductList collapse={collapse} {...this.props} />
        }

        <ul className={styles.ulStyle}>
          {
            filterMenuList.map(it =>
              !collapse ?
                this.getUnCollapse(it)
                :
                this.getCollapse(it)
            )
          }
        </ul>


        <span>
          {
            !collapse ?
              <span className={styles.bottom}>
                {
                  lastProduct.productAdmin &&
                  <a
                    onClick={() => history.push(`/product_setting/basic_info?productid=${lastProduct.id}`)}
                    disabled={!lastProduct.productAdmin}
                  >
                    <div className={styles.productSetting}>
                      <MyIcon type="icon-chanpinshezhiicon" className={styles.icon} />
                      <span className="u-mgl10">产品设置</span>
                    </div>
                  </a>
                }

                <MyIcon type="icon-zhankai1" className={styles.expandIcon} onClick={(e) => this.handleCollpse(e)} />
              </span>
              :
              <span className={styles.bottom}>
                {
                  lastProduct.productAdmin &&
                  <a
                    onClick={() => history.push(`/product_setting/basic_info?productid=${lastProduct.id}`)}
                  >
                    <MyIcon type="icon-chanpinshezhiicon" className={styles.productSetting} />
                  </a>
                }
                <MyIcon type="icon-zhankai1" className={styles.collapseIcon} onClick={(e) => this.handleCollpse(e)} />
              </span>
          }
        </span>
      </div >
    );
  }
}

export default index;
