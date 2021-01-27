import React, { Component } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Row, Col, Breadcrumb, Dropdown, Menu } from 'antd';
import { Link } from 'umi';
import moment from 'moment';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import { dateDiff } from '@utils/helper';
import styles from '../index.less';

const style = {
  height: '250px',
  overflow: 'auto',
};

class Header extends Component {
  state = {
    visibleDrop: false,
  }

  menu = () => {
    const { versionList, versionSelect } = this.props;
    const len = versionList && versionList.length;
    const versionid = versionSelect.version.id;
    let filterList = versionList;
    if (versionid) {
      filterList = versionList.filter(it => it.version.id !== Number(versionid));
    }

    return (
      <Menu>
        <div className={styles.versionMenu} style={(len && len > 10) ? style : null}>
          {
            filterList && filterList.map(item => (
              <Link to={`/manage/version/detail?versionid=${item.version.id}&productid=${item.product.id}`} target="_blank">
                <div
                  className={styles.linkItem}
                  key={item.version.id}
                  onClick={() => this.setState({ visibleDrop: false })}
                >
                  <span className="u-mgl10 u-mgr10">
                    {item.version.name && item.version.name.length > 15 ? `${item.version.name.substring(0, 14)}...` : item.version.name}
                  </span>
                </div>
              </Link>
            ))
          }
        </div>
      </Menu>);
  }

  handleVisibleChange = flag => {
    this.setState({ visibleDrop: flag });
  };

  render() {
    const { versionSelect } = this.props;
    const display = versionSelect.version || {};
    const displayProduct = versionSelect.product || {};

    let diffDay = 0;
    if(display.endtime !== 0) {
      diffDay = dateDiff(moment().format('YYYY-MM-DD'), moment(display.endtime).format('YYYY-MM-DD'));
    }

    return (
      <span>
        <Row className={styles.headerContainer}>
          <Col span={18}>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to={`/manage/version/list?productid=${displayProduct.id}`}>
                  <a onClick={() => this.props.dispatch({ type: 'product/setLastProduct', payload: { productId: displayProduct.id } })}>版本列表</a>
                </Link>
              </Breadcrumb.Item>
              <Dropdown
                overlay={this.menu}
                onVisibleChange={this.handleVisibleChange}
                visible={this.state.visibleDrop}
              >
                <a>
                  {
                    display.name && display.name.length > 15 ? `${display.name.substring(0, 14)}...` : display.name
                  }
                  <DownOutlined />
                </a>
              </Dropdown>
            </Breadcrumb>
            <div className={`u-mgt15 f-aic ${styles.headerStyle}`}>
              <MyIcon type='icon-banben1' style={{ fontSize: '32px' }} />
              <TextOverFlow
                content={<span className={`u-mgr10 u-mgl10 ${styles.title}`}>{display.name}</span>}
                maxWidth={'40vw'}
              />
              <span className={styles.subtitle}>(计划发布日期 { display.endtime === 0 ? '-' : moment(display.endtime).format('YYYY-MM-DD')})</span>
            </div>
          </Col>
          <Col span={6}>
            <span className="f-fr f-fs1">
              {
                diffDay >= 0 ?
                  <div className='f-tac'>
                    <div className={styles.textDes}>倒计时</div>
                    <div className={`u-mgt5 ${styles.willDay}`}>{diffDay}天</div>
                  </div> :
                  <div className='f-tac'>
                    <div className={styles.textDes}>已逾期</div>
                    <div className={`u-mgt5 ${styles.overDay}`}>{Math.abs(diffDay)}天</div>
                  </div>
              }
            </span>
          </Col>
        </Row>
        <Row className={styles.versionDescContainer}>
          <Col span={20}>
            <span className={styles.versionName}>版本描述：</span>
            <span className={styles.versionDesc}>{display.description ? display.description : '--'}</span>
          </Col>
        </Row>
      </span>
    );
  }
}

export default Header;
