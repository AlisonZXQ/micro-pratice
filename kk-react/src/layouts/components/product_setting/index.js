import React, { Component } from 'react';
import { Link } from 'umi'; // 后面单据上来以后在更改 返回产品 按钮的触发方式
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import BusinessHOC from '@components/BusinessHOC';
import { menuSettingList, urlSettingMap } from '@shared/LayoutConfig';
import styles from './index.less';

class index extends Component {
  state = {
    value: '',
  }

  componentDidMount() {
    const { pathname } = window.location;
    for (let i in urlSettingMap) {
      if (pathname.includes(urlSettingMap[i])) {
        this.setState({ value: i });
      }
    }
  }

  handleClick = (key) => {
    this.setState({ value: key });
  }

  // 0-X 报表和数据分析的拿掉了
  getSetMenuList = (it) => {
    const { lastProduct, isBusiness } = this.props;
    const { value } = this.state;
    let children = it.children || [];
    // 商业化去掉cloudcc
    children = isBusiness ? children.filter(i => i.key !== '1-9') : children;

    return (<span>
      <div style={{ padding: '20px 12px 15px' }}>{it.name}</div>
      {
        children.map(item =>
          (item.key === '0-1' || item.key === '0-2') ?
            <a
              href={`${urlSettingMap[item.key]}`}
              className={`${styles.settingItem} ${value === item.key ? styles.settingItemActive : ''}`}
            >
              {item.name}
            </a> :
            <Link
              to={`${urlSettingMap[item.key]}?productid=${lastProduct.id}`}
              className={`${styles.settingItem} ${value === item.key ? styles.settingItemActive : ''}`}
              onClick={() => this.handleClick(item.key)}
            >
              <span>{item.name}</span>
              {value === item.key && <span className={styles.ItemArrow}>
                <MyIcon type="icon-cebianlanjiantou" />
              </span>}
            </Link>)
      }
    </span>);
  }

  render() {
    const { lastProduct } = this.props;

    return (<div className={styles.sider}>
      <ul className={styles.ulStyle}>
        <a
          className={styles.return}
          onClick={() => history.push(`/manage/productadvise/?productid=${lastProduct.id}&productname=${lastProduct.name}`)}>
          <div
            className={styles.returnProduct}>
            <span style={{ marginRight: '8px' }}>
              <MyIcon type="icon-fanhuihoutaizuojiantou" />
            </span>
            返回产品
          </div>
        </a>

        {
          menuSettingList.map(it =>
            this.getSetMenuList(it)
          )
        }
      </ul>
    </div>);
  }
}

export default BusinessHOC()(index);
