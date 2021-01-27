import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Row, Col, message } from 'antd';
import DefineDot from '@components/DefineDot';
import MyIcon from '@components/MyIcon';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { NO_OPT_PERMISSION_TIP_MSG } from '@shared/ReceiptConfig';
import { nameMap, colorMap, getChangeData } from './EditStatusFun';
import styles from './index.less';

/***
 * @description - 编辑状态的通用组件
 * @currentUserType - 当前用户具有的角色 负责人/报告人/验证人
 */
class EditSelectStatus extends Component {
  state = {
    inputValue: '',
    visible: false,
  };

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  handleSelectItem = (e, value) => {
    e.stopPropagation();
    this.props.handleUpdate(value);
  }

  menu = () => {
    const { type, value, currentUserType } = this.props;
    const { inputValue } = this.state;
    let data = getChangeData(type, currentUserType, value);

    return (
      <Menu style={{ width: '200px' }}>
        <div className={styles['m-menu']}>
          {data && data
            .filter(it => !inputValue || it.status.includes(inputValue))
            .map((item) => (
              <div className={`f-toe ${styles['m-item']}`} onClick={(e) => { this.handleSelectItem(e, item.value); this.setState({ visible: false }) }}>
                <Row>
                  <Col span={10}>
                    <span>{item.action}</span>
                  </Col>
                  <Col span={4}>
                    <MyIcon type="icon-jiantoubianhuan" />
                  </Col>
                  <Col span={10}>
                    <span style={{ position: 'relative' }}>
                      <DefineDot
                        text={item.value}
                        statusMap={nameMap[type]}
                        statusColor={colorMap[type]}
                      />
                    </span>
                  </Col>
                </Row>

              </div>
            ))}
        </div>
      </Menu>);
  };

  onVisibleChange = (visible) => this.setState({ visible });

  render() {
    const { value, type, issueRole, bgHover, currentUserType } = this.props;
    const { visible } = this.state;
    const editAccess = issueRole || ISSUE_ROLE_VALUE_MAP.MANAGE;
    let data = getChangeData(type, currentUserType, value);

    return (
      <span className="f-csp" id="select" style={{ position: 'relative', display: 'block', width: '100px' }}>
        {
          editAccess !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
          <span onClick={(e) => { e.stopPropagation(); message.error(NO_OPT_PERMISSION_TIP_MSG) }}>
            {
              value ?
                <span style={{ position: 'relative', top: '-2px' }}>
                  <DefineDot
                    text={value}
                    statusMap={nameMap[type]}
                    statusColor={colorMap[type]}
                  />
                </span>
                :
                '请选择'
            }
            <CaretDownOutlined className={"dropDownIcon"} style={{ fontSize: '8px', marginLeft: '4px' }} />
          </span>
        }

        {
          editAccess === ISSUE_ROLE_VALUE_MAP.MANAGE && !!data.length &&
          <Dropdown
            trigger={['click']}
            onClick={e => e.stopPropagation()}
            overlay={this.menu()}
            visible={visible}
            onVisibleChange={this.onVisibleChange}
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            <span
              className={`f-iaic ${bgHover ? styles.bgHover : ''}`}
              style={bgHover ? {} : { position: 'absolute', top: '-21px', height: '44px' }}>
              {
                value ?
                  <span>
                    <DefineDot
                      text={value}
                      statusMap={nameMap[type]}
                      statusColor={colorMap[type]}
                    />
                  </span>
                  :
                  '请选择'
              }
              <CaretDownOutlined
                className={"dropDownIcon"}
                style={{ position: 'relative', marginLeft: '4px', top: '1px' }} />
            </span>
          </Dropdown>
        }

        {
          editAccess === ISSUE_ROLE_VALUE_MAP.MANAGE && !data.length &&
          <DefineDot
            text={value}
            statusMap={nameMap[type]}
            statusColor={colorMap[type]}
          />
        }

      </span>
    );
  }
}

export default EditSelectStatus;
