import React, { Component } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import styles from './index.less';

/**
 * @des 编辑标题
 */
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      title: '',
    };
  }

  componentDidMount() {
    const { title } = this.props;
    if (title) {
      this.setState({ title: title });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.title !== nextProps.title) {
      this.setState({ title: nextProps.title });
    }
  }

  handleCheck = () => {
    const { title } = this.state;
    if (title.trim().length) {
      this.props.handleSave(title);
      this.setState({ edit: false });
    }
  }

  getName = (title) => {
    const { maxWidth, columns } = this.props;
    let listMaxWidth = 300;
    // if (columns) {
    //   listMaxWidth = (8 - columns.length) * 100 + 300;
    //   listMaxWidth = listMaxWidth <= 300 ? 300 : listMaxWidth;
    // }

    return <span className={`f-fs2 u-mgr10 f-ib`}>
      <TextOverFlow content={title} maxWidth={maxWidth || listMaxWidth} />
    </span>;
  }

  render() {
    const { edit, title } = this.state;
    const { hoverRowId, rowId, maxWidth } = this.props;
    const styleShow = hoverRowId === rowId ? { opacity: 1 } : { opacity: 0 };

    return (
      <span className='f-ib'>
        {
          !edit &&
          <span className={`f-aic ${styles.showTitle}`}>
            {this.getName(title)}
            <MyIcon
              onClick={(e) => { e.stopPropagation(); this.setState({ edit: true }) }}
              style={{ position: 'relative', top: '1px', ...styleShow }}
              type='icon-bianji'
              className={`issueIcon f-fs3`}
            />
          </span>
        }
        {
          edit &&
          <span>
            <Input
              value={title}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { this.setState({ title: e.target.value }) }}
              style={{ width: maxWidth || 300 }}
            />
            <span className="f-ib">
              <div
                className={`${styles.checkButton} u-mgl10`}
                onClick={(e) => { e.stopPropagation(); this.handleCheck() }}>
                <CheckOutlined />
              </div>
              <div
                className={`${styles.checkButton} u-mgl10`}
                onClick={(e) => { e.stopPropagation(); this.setState({ edit: false, title: this.props.title }) }}>
                <CloseOutlined />
              </div>
            </span>
          </span>
        }
      </span>
    );
  }
}

export default index;
