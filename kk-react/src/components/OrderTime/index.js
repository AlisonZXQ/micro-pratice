import React, { PureComponent } from 'react';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

class OrderTime extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showCard: false,
      orderField: 1, // 与传入的数据源对应1是按XX排序
      order: 2, // 降序
      orderFieldData: [],
      orderData: []
    };
  }

  componentDidMount() {
    const { type, from } = this.props;
    if (from && from === 'my_workbench') {
      this.getDefaultStorageValue(); // 个人工作台保存时间条件
    }

    //默认值
    if (type) {
      const issueType = this.props.type && this.props.type.split('_');
      const issueOrder = localStorage.getItem(`${issueType[1]}Order`) ?
        JSON.parse(localStorage.getItem(`${issueType[1]}Order`)) : {};
      if (JSON.stringify(issueOrder) !== '{}') {
        this.setState({ orderField: issueOrder.orderby, order: issueOrder.order });
        // this.changeOrderField(issueOrder.orderby);
        // this.changeOrder(issueOrder.order);
      } else {
        // this.changeOrderField(this.state.orderField);
        // this.changeOrder(this.state.order);
      }
    }

    let newOrderFieldData = this.props.orderFieldData;
    newOrderFieldData && newOrderFieldData.forEach((item, index) => {
      item.key = index + 1;
    });
    this.setState({ orderFieldData: newOrderFieldData });
    let newOrderData = this.props.orderData;
    newOrderData && newOrderData.forEach((item, index) => {
      item.key = index + 1;
    });
    this.setState({ orderData: newOrderData });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.orderFieldData !== this.props.orderFieldData) {
      let newOrderFieldData = nextProps.orderFieldData;
      newOrderFieldData && newOrderFieldData.forEach((item, index) => {
        item.key = index + 1;
      });
      this.setState({ orderFieldData: newOrderFieldData });
      let newOrderData = this.props.orderData;
      newOrderData && newOrderData.forEach((item, index) => {
        item.key = index + 1;
      });
      this.setState({ orderData: newOrderData });
    }
  }

  getDefaultStorageValue = () => {
    const { defaultOrderField, defaultOrder } = this.props;
    this.setState({
      orderField: defaultOrderField || 1,
      order: defaultOrder || 2,
    });
  }

  changeOrderField = (key) => {
    this.setState({ orderField: key });
    this.props.changeOrderField(key);
  }

  changeOrder = (key) => {
    this.setState({ order: key });
    this.props.changeOrder(key);
  }

  handleShow = (flag) => {
    const { showCard } = this.state;
    if (flag !== showCard) {
      this.setState({ showCard: flag });
    }
  }

  render() {
    const { showCard, orderFieldData, orderData, orderField, order } = this.state;
    const { type } = this.props;

    return (<div className='f-ib'>
      <div
        className={`${styles.container} f-jcc-aic`}
        style={type && type.includes('issue') ? { width: '126px' } : {}}
        onMouseMove={() => this.handleShow(true)}
        onMouseLeave={() => this.handleShow(false)}
      >
        {orderFieldData.map(item => {
          if (item.key === orderField) {
            return <span>{item.name}</span>;
          }
        })}
        <span style={{ display: 'flex', flexDirection: 'column', marginLeft: '4px' }}>
          <MyIcon className={`${styles.icon} ${order === 1 ? styles.colorOrderSelect : styles.colorOrderUnSelect}`} type="icon-shang" />
          <MyIcon className={`${styles.icon} ${order === 2 ? styles.colorOrderSelect : styles.colorOrderUnSelect}`} type="icon-xia" />
        </span>

        <div className={styles.null} style={type && type.includes('issue') ? { width: '126px' } : {}}></div>

        {showCard && <div
          className={styles.card}
          style={type && type.includes('issue') ? { width: '126px' } : {}}
        >
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {orderFieldData.map(item => (
              <span
                className={`${styles.cardItem} ${orderField === item.key ? styles.active : ''}`}
                onClick={() => this.changeOrderField(item.key)}
              >
                {item.name}
              </span>
            ))}
          </div>
          <div className={styles.line}></div>
          {orderData.map(item => (
            <span
              className={`${styles.cardItem} ${order === item.key ? styles.active : ''}`}
              onClick={() => this.changeOrder(item.key)}
            >
              {item.name}
            </span>
          ))}
        </div>}
      </div>
    </div>);
  }
}


export default OrderTime;
