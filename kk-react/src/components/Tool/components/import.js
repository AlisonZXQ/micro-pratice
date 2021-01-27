import React, { Component } from 'react';
import { Steps } from 'antd';
import { connect } from 'dva';
import NoPermission from '@components/403';
import { hasPermission } from '@utils/helper';
import { USERGROUP_PERMISSION_KEY_MAP } from '@shared/CommonConfig';
import StepOne from './stepOne.js';
import StepTwo from './stepTwo.js';
import StepThree from './StepThree.js';
import styles from './import.less';

const { Step } = Steps;

class Import extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      type: {},
      secondList: {},
      thirdList: {},
      typeMap: [
        { key: 'advise', value: '建议' },
        { key: 'requirement', value: '需求' },
        { key: 'task', value: '任务' },
        { key: 'bug', value: '缺陷' },
        { key: 'objective', value: '目标' },
        { key: 'ticket', value: '工单' },
      ]
    };
  }

  componentDidMount() {
    const { type } = this.props.location.query;
    this.state.typeMap.map(item => {
      if (type === item.key) {
        this.setState({ type: item });
      }
    });
  }

  setCurrent = (val, List) => {
    this.setState({ current: val });
    if (val === 1) {
      this.setState({ secondList: List });
    }
    if(val === 2) {
      this.setState({ thirdList: List });
    }
  }

  render() {
    const { current, type, secondList, thirdList } = this.state;
    const { lastProduct } = this.props;
    const typePrefix = type && type.key && type.key.toUpperCase() +'_ROLE_';

    return (
      ( hasPermission(USERGROUP_PERMISSION_KEY_MAP[typePrefix + 'MANAGE'], lastProduct.perssionList)
        || hasPermission(USERGROUP_PERMISSION_KEY_MAP[typePrefix + 'EDIT'], lastProduct.perssionList)
      ) ?
        <div style={{ padding: '0px 16px' }}>
          <div className='bbTitle'>
            <span className='name'>批量导入{type.value}</span>
          </div>

          <div className='bgWhiteModel'>
            <Steps current={current} size="small" style={{ padding: '0px 78px', marginTop: '20px' }}>
              <Step />
              <Step />
              <Step />
            </Steps>
            <div className={styles.description}>
              <span className={styles.left}>下载模版并填充数据</span>
              <span>确认待导入的数据（仅可导入数据将被导入）</span>
              <span className={styles.right}>导入结果显示</span>
            </div>
            <div className={styles.content}>
              {current === 0 && <StepOne
                setCurrent={this.setCurrent}
                type={type}
              />}
              {current === 1 && <StepTwo
                setCurrent={this.setCurrent}
                secondList={secondList}
                type={type}
              />}
              {current === 2 && <StepThree
                setCurrent={this.setCurrent}
                thirdList={thirdList}
                type={type}
              />}
            </div>
          </div>
        </div>
        : <NoPermission/>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct
  };
};

export default connect(mapStateToProps)(Import);
