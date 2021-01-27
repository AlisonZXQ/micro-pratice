import React, { Component } from 'react';
import { Badge } from 'antd';
import styles from './index.less';

/**
 * @description - 自定义切换tab组件
 * @param {String} defaultKey - 默认选择的tab
 * @param {Array} tabsData - 当前传入的tab数组
 * @param {ReactNode} extra - 右边的额外展示
 * @param {object} className - 传入的类
 * @param {object} style - 传入的style
 * @param {String} activeKey - 当前选择的key
 */
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 0,
    };
  }

  componentDidMount() {
    const { defaultKey } = this.props;
    this.setState({ activeKey: defaultKey });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.defaultKey !== nextProps.defaultKey) {
      this.setState({ activeKey: nextProps.defaultKey });
    }
  }

  render() {
    const { tabsData, style, extra, className } = this.props;
    const { activeKey } = this.state;

    return (<div className={`${styles.container} ${className}`} style={style}>
      {
        tabsData && tabsData.map(it =>
          <div
            className={activeKey === it.key ? styles.tabActive : styles.tabTodo}
            onClick={() => { this.setState({ activeKey: it.key }); this.props.callback(it.key) }}
          >
            <div className={styles.text}>
              {
                it.badge ?
                  <Badge count={it.badge}>
                    <span className="f-fs3">{it.name}</span>
                  </Badge>
                  :
                  <span>{it.name}</span>
              }
            </div>
          </div>)
      }
      {
        extra
      }
    </div>);
  }
}

export default index;

