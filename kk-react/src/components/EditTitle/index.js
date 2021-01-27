import React, { Component } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import styles from './index.less';

/**
 * @des 编辑标题
 * @hoverShow hover上去才展示标题
 */
class index extends Component {

  state = {
    edit: false,
    title: ''
  };

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

  getName = (type, title) => {
    const { maxWidth, titleClassName, titleStyle } = this.props;

    return <span className={`f-fs4 ${styles.title}`}>
      <TextOverFlow content={title || '--'} maxWidth={maxWidth || '280px'} className={titleClassName} style={titleStyle} />
    </span>;
  }

  handleClickIcon = (e) => {
    e.stopPropagation();
    this.setState({ edit: true });
  }

  render() {
    const { edit, title } = this.state;
    const { type, maxWidth, issueRole: role, hoverShow } = this.props;
    const issueRole = role || ISSUE_ROLE_VALUE_MAP.MANAGE;

    return (
      <span className='f-ib'>
        {
          !edit &&
          <span className={`f-aic ${hoverShow ? styles.hoverShowEdit : ''}`}>
            {this.getName(type, title)}
            {
              (issueRole === ISSUE_ROLE_VALUE_MAP.EDIT || issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE) &&
              <span className={styles.icon}>
                <MyIcon
                  onClick={(e) => { this.handleClickIcon(e) }}
                  style={{ fontSize: '16px' }}
                  type='icon-bianji'
                  className="issueIcon"
                />
              </span>
            }
          </span>
        }

        {
          edit &&
          <span>
            <Input
              value={title}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { this.setState({ title: e.target.value }) }}
              style={{ width: maxWidth ? `calc(${maxWidth} - 50px)` : 300 }}
              maxLength={100}
            />
            <span className="f-ib">
              <span
                className={`${styles.checkButton} u-mgl10`}
                onClick={(e) => { e.stopPropagation(); this.handleCheck() }}>
                <CheckOutlined />
              </span>
              <span
                className={`${styles.checkButton} u-mgl10`}
                onClick={(e) => { e.stopPropagation(); this.setState({ edit: false, title: this.props.title }) }}>
                <CloseOutlined />
              </span>
            </span>
          </span>
        }
      </span>
    );
  }
}

export default index;
