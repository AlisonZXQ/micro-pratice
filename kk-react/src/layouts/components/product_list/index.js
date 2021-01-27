import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

const detailRoutes = ['/v2/my_workbench/requirementdetail/', '/v2/my_workbench/advisedetail/', '/v2/my_workbench/taskdetail/', '/v2/my_workbench/bugdetail/', '/v2/my_workbench/objectivedetail/', '/v2/my_workbench/ticketdetail/'];

class index extends Component {
  state = {
    over: false,
  }
  divElement = null;

  componentDidMount() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      // 组件已挂载且事件触发对象不在div内
      if (this.divElement && !this.divElement.contains(target)) {
        this.setState({ over: false });
      }
    }, true);
  }

  handleChangeOver = (over) => {
    this.setState({ over: !over });
  }

  handleSelect = async (id) => {
    const { lastProduct } = this.props;
    const { pathname } = window.location;
    /**
     * 仍是当前产品，直接return
     */
    if (id === lastProduct.id) {
      return;
    }
    this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: '' });
    await this.props.dispatch({ type: 'product/setLastProduct', payload: { productId: id } });
    /**
     * 单据详情页切换产品后跳转到建议列表页
     */
    if (detailRoutes.some(it => pathname.includes(it))) {
      history.push(`/manage/productadvise/?productid=${id}`);
    }
  }

  render() {
    const { collapse, lastProduct, productList } = this.props;
    const { over } = this.state;

    return (
      <span>
        <div
          ref={node => this.divElement = node}
          className={`${collapse ? styles.collapseContainer : styles.container} f-csp`}
          onClick={(e) => { e.stopPropagation(); this.handleChangeOver(over) }}
        >
          {
            !collapse &&
            <div className={styles.product}>
              <span>
                <MyIcon type="icon-xiangmumorenicon" className={styles.pic} />
                <Popover
                  content={lastProduct.name}
                >
                  <span className={`f-toe ${styles.name}`} style={{ maxWidth: '70px' }}>
                    {lastProduct.name}
                  </span>
                </Popover>
                <CaretDownOutlined className={styles.icon} />
              </span>

              {
                over &&
                <div className={styles.siderList}>
                  {
                    productList && productList.map(it => (
                      <div
                        className={`${styles.itemStyle}`}
                        onClick={() => this.handleSelect(it.id)}>
                        <div
                          className={it.id === lastProduct.id ? styles.select : styles.noSelect}>
                          <div className={styles.overText} title={it.name}>
                            {it.name}
                          </div>
                        </div>
                      </div>))
                  }
                </div>
              }

            </div>
          }

          {
            collapse &&
            <div className={styles.product}>
              <MyIcon type="icon-xiangmumorenicon" className={styles.pic} />
              {
                over &&
                <div className={styles.siderList}>
                  {
                    productList && productList.map(it => (<div className={styles.itemStyle} onClick={() => this.handleSelect(it.id)}>
                      <div className={it.id === lastProduct.id ? styles.select : styles.noSelect}>
                        <div className={styles.overText} title={it.name}>
                          {it.name}
                        </div>
                      </div>
                    </div>))
                  }
                </div>
              }
            </div>
          }
        </div>
      </span>
    );
  }
}

export default index;
