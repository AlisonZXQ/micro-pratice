import React, { Component } from 'react';
import { Spin } from 'antd';
import TextOverFlow from '@components/TextOverFlow';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

class MyProducts extends Component {
  state = {
    screenWidth: 0,
    left: 0,
  };

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.setState({ screenWidth: document.body.clientWidth - 89 });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    this.setState({ screenWidth: document.body.clientWidth - 89 });
  }

  toLeft = (isNone) => {
    if (isNone) {
      return;
    } else {
      const currentLeft = this.state.left - 158 * 4;
      this.setState({ left: currentLeft });
    }
  }

  toRight = (isNone) => {
    if (isNone) {
      return;
    } else {
      const currentLeft = this.state.left + 158 * 4;
      this.setState({ left: currentLeft });
    }
  }

  handleClickProduct = (id) => {
    this.props.dispatch({ type: 'product/setLastProduct', payload: { productId: id } });
  }

  render() {
    const { productLoading, productList } = this.props;
    const { left, screenWidth } = this.state;
    const currentWidth = 158 * ((productList && productList.length) || 0) + left;
    const isOverFlow = screenWidth < currentWidth;
    const hiddenArrow = left === 0 && !isOverFlow;

    return (<span className={styles.container}>
      <Spin spinning={productLoading}>
        <div className="u-mgb10 u-mgl20 u-mgt10 f-fwb">我的产品</div>
        <div className={styles.carousel}>
          {
            !hiddenArrow &&
            <MyIcon
              onClick={() => this.toRight(left === 0)}
              type='icon-fanhuitubiao'
              className={`${styles.left} ${left !== 0 ? styles.enable : styles.disable}`}
            />
          }

          <div className={styles.middle}>
            <ul style={{ marginBottom: '0px', left: `${left}px` }}>
              {
                productList.map(it =>
                  <a
                    href={`/v2/manage/productadvise/?productid=${it.id}&productname=${it.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => this.handleClickProduct(it.id)}
                  >
                    <li>
                      {it.productOwner && <MyIcon type="icon-biaoqian" className={styles.icon} />}
                      <TextOverFlow content={it.name} maxWidth={'100px'} />
                    </li>
                  </a>)
              }
            </ul>
          </div>

          {
            !hiddenArrow
            &&
            <MyIcon
              onClick={() => this.toLeft(!isOverFlow)}
              type='icon-fanhuitubiao'
              className={`${styles.right} ${isOverFlow ? styles.enable : styles.disable}`}
            />
          }
        </div>
      </Spin>
    </span>);
  }
}

export default MyProducts;
