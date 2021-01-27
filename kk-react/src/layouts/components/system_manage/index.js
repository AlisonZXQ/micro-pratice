import React, { Component } from 'react';
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import { menuManageList, urlManageMap } from '@shared/LayoutConfig';
import styles from './index.less';

class index extends Component {
  state = {
    value: '',
  }

  componentDidMount() {
    const { pathname } = window.location;
    for (let i in urlManageMap) {
      if (pathname.includes(urlManageMap[i])) {
        this.setState({ value: i });
      }
    }
  }

  handleClick = (key) => {
    this.setState({ value: key });
    history.push(`${urlManageMap[key]}`);
  }

  getSetMenuList = (it) => {
    const { value } = this.state;

    return (<span>
      <div style={{ padding: '20px 12px 15px' }}>{it.name}</div>
      {
        it.children.map(item =>
          <a
            className={`${styles.settingItem} ${value === item.key ? styles.settingItemActive : ''}`}
            onClick={() => this.handleClick(item.key)}
          >
            <span>{item.name}</span>
            {value === item.key && <span className={styles.ItemArrow}>
              <MyIcon type="icon-cebianlanjiantou" />
            </span>}
          </a>)
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
            <span style={{ marginRight: '8px' }}>←</span>
            退出系统管理
          </div>
        </a>

        {
          menuManageList.map(it =>
            this.getSetMenuList(it)
          )
        }
      </ul>
    </div>);
  }
}

export default index;
