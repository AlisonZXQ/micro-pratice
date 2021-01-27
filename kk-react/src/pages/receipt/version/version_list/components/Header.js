import React, { Component } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Menu, Input, DatePicker, message, Popover, Modal } from 'antd';
import { dateDiff } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { updateVersion, deleteVersion } from '@services/version';
import { deleteModal } from '@shared/CommonFun';
import { VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import { getFormLayout } from '@utils/helper';
import DropDown from '@components/CustomAntd/drop_down';
import OpenVersion from '@pages/receipt/components/OpenVersion';
import PublishVersion from '@pages/receipt/components/publish_version';
import styles from '../index.less';

const formLayout = getFormLayout(6, 18);
const FormItem = Form.Item;
const MenuItem = Menu.Item;
const dateFormat = 'YYYY-MM-DD';
const DISPATCH_GET_VERSION_LIST = 'version/getVersionList';

class Header extends Component {
  state = {
    versionVisible: false, //编辑版本
    visible: false,
    type: '', // publish 发布 open 开启
    publishList: [],
    publishLoading: false,
    prePublish: false,
    openLoading: false,
    publishClosedCheckList: [],
    autoStart: false //版本开启后自动设置内容状态为解决中
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.activeId !== nextProps.activeId) {
      this.setState({
      });
    }
  }

  isEmpty = (text) => {
    return text ? text : '-';
  }

  getNextVersionId = (id) => {
    const { versionList } = this.props;
    const index = versionList.findIndex(it => it.version.id === Number(id));
    if (versionList.length > 1) {
      let obj = versionList[index + 1];
      if (index + 1 === versionList.length) {
        obj = versionList[0];
      }
      if (obj) {
        this.props.getNextVersion(obj.version.id);
      }
    }
  }

  handleDelete = () => {
    this.setState({ visible: false });
    const { versionSelect } = this.props;
    const params = {
      id: versionSelect.version.id,
    };
    const that = this;

    deleteModal({
      title: '版本删除后不可恢复，版本中所有需求退回需求池',
      content: '确定要删除吗？',
      okCallback: () => {
        deleteVersion(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          that.getNextVersionId(versionSelect.version.id);

          that.props.dispatch({ type: DISPATCH_GET_VERSION_LIST, payload: that.getVersionListParam() });
          that.props.dispatch({ type: 'version/saveVersionSelect', payload: {} });
        }).catch((err) => {
          return message.error(err || err.message);
        });
        message.success('版本已删除');
      }
    });
  }

  handleOk = () => {
    const { versionSelect } = this.props;
    this.props.form.validateFields(['name', 'description', 'endtime'], (err, values) => {
      if (err) return;

      const params = {
        id: versionSelect.version.id,
        ...values,
        endtime: values.endtime && new Date(values.endtime).getTime(),
      };

      updateVersion(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('版本更新成功！');
        this.props.getVersionSelectList();
        this.props.getVersionList();
        this.props.dispatch({ type: 'version/getVersionSelect', payload: { id: versionSelect.version.id } });
        this.setState({ versionVisible: false });
      }).catch((err) => {
        return message.error(err || err.message);
      });
    });
  }

  handleEditVersion = (item) => {
    this.setState({ versionVisible: true, item: item, visible: false });
  }

  menu = (status, id, item) => {
    const { versionSelect, filterObj, versionSelectList, displayProduct } = this.props;

    return (<Menu style={{ width: '150px' }}>
      {VERISON_STATUS_MAP.NEW === status &&
      <MenuItem key={1} className='f-tac' onClick={() => this.setState({ visible: false })}>
        <OpenVersion
          trigger={<span className='f-ib' style={{ width: '150px', marginLeft: '-12px' }}>开启版本</span>}
          versionId={versionSelect.version.id}
          dueDate={versionSelect.version.endtime}
          hasContent={!!versionSelectList.length}
          okCallback={() => {
            this.props.dispatch({ type: DISPATCH_GET_VERSION_LIST, payload: this.getVersionListParam() });
            this.props.dispatch({ type: 'version/getVersionSelect', payload: { id: versionSelect.version.id } });
          }}
        />
      </MenuItem>}
      {VERISON_STATUS_MAP.OPEN === status &&
      <MenuItem key={2} className='f-tac' onClick={() => this.setState({ visible: false })}>
        <PublishVersion
          trigger={<span className='f-ib' style={{ width: '150px', marginLeft: '-12px' }}>发布版本</span>}
          versionId={versionSelect.version.id}
          okCallback={() => {
            this.props.dispatch({ type: DISPATCH_GET_VERSION_LIST, payload: this.getVersionListParam() });
            this.props.dispatch({ type: 'version/getVersionSelect', payload: { id: versionSelect.version.id } });
            this.props.dispatch({ type: 'version/getVersionSelectList', payload: { versionid: versionSelect.version.id, ...filterObj } });
          }}
        />
      </MenuItem>}

      <MenuItem key={4} className='f-tac' onClick={() => window.open(
        `/v2/manage/version/detail?versionid=${id}&productid=${displayProduct.id}`
      )}>
        <span>进入看板</span>
      </MenuItem>

      <MenuItem key={5} className='f-tac' onClick={() => this.handleEditVersion(item)}>
        <span>编辑版本</span>
      </MenuItem>

      {VERISON_STATUS_MAP.NEW === status &&
      <MenuItem key={3} className='f-tac' onClick={() => this.handleDelete()}>
        <span>删除版本</span>
      </MenuItem>}
    </Menu>);
  }

  getVersionListParam = () => {
    const { versionSelect, filterObj } = this.props;
    return {
      productId: versionSelect.product.id,
      name: filterObj.name ? filterObj.name : '',
      subProductIdList: filterObj.subProductIdList ? filterObj.subProductIdList : '',
      state: [VERISON_STATUS_MAP.NEW, VERISON_STATUS_MAP.OPEN]
    };
  }

  render() {
    const { versionSelect } = this.props;
    const { versionVisible, item } = this.state;
    const { form: { getFieldDecorator } } = this.props;

    const display = (versionSelect && versionSelect.version) || {};
    const product = (versionSelect && versionSelect.product) || {};
    const subProduct = (versionSelect && versionSelect.subProduct) || {};

    const diffDay = dateDiff(moment().format(dateFormat), moment(display.endtime).format(dateFormat));

    return (<div>
      <Row className={`${styles.headerStyle}`}>
        <Col span={20}>
          <span className="u-mgl10">
            <span>
              <span
                className={`${styles.title} u-mgr5`}
                style={{ width: 'calc(100% - 20px)' }}
              >
                <Popover
                  content={display.name}
                >
                  <span
                    style={{ maxWidth: '70%', position: 'relative', top: '2px' }}
                    className={`f-ib f-toe`}
                  >
                    {display.name}
                  </span>
                </Popover>
              </span>
            </span>
          </span>

          <span className={`u-mgl15 ${styles.headTag}`}>
            {product && product.name}/
            {subProduct && subProduct.name}
          </span>

          <span className={'u-mgl25'}>
            <span>
              {
                display.endtime ?
                  <span>
                    {moment(display.endtime).format(dateFormat)}
                  </span> : '-'
              }
            </span>
            {
              display.state === VERISON_STATUS_MAP.OPEN &&
              <span className="f-fs1 u-mgl10 f-wsn">
                {
                  diffDay >= 0 ? `${diffDay}天剩余` :
                    <span>已逾期
                      <span className={styles.overDay}>{Math.abs(diffDay)}</span>天
                    </span>
                }
              </span>
            }
          </span>
        </Col>

        <Col span={4} className='f-tar' style={{ paddingRight: '8px' }}>
          {
            <DropDown
              visible={this.state.visible}
              onVisibleChange={(visible) => this.setState({ visible: visible })}
              overlay={this.menu(display.state, display.id, display)}
            />
          }
        </Col>
      </Row>

      <Row>
        <Col span={10}>
          <div className="u-mgl10">
            <span>
              <span
                className={`${styles.title} u-mgr5`}>
                {display.description ?
                  <Popover
                    content={display.description}
                  >
                    <span
                      className={`f-ib f-toe ${styles.descriptionStyle}`}
                    >
                      {display.description}
                    </span>
                  </Popover> : <span>--</span>}
              </span>
            </span>
          </div>
        </Col>
      </Row>
      <Modal
        title='编辑版本'
        onCancel={() => this.setState({ versionVisible: false })}
        onOk={() => this.handleOk()}
        destroyOnClose
        visible={versionVisible}>
        <FormItem label="版本" {...formLayout}>
          {getFieldDecorator('name', {
            initialValue: item && item.name,
            rules: [
              { required: true, message: `此项不能为空` },
            ],
          })(
            <Input placeholder="请输入版本名称，不超过50字" className="f-fw" maxLength={50} />
          )}
        </FormItem>

        <FormItem label="计划发布日期" {...formLayout}>
          {getFieldDecorator('endtime', {
            initialValue: item && item.endtime ? moment(item.endtime) : undefined,
            rules: [
              { required: true, message: `此项不能为空` },
            ],
          })(
            <DatePicker className="f-fw" suffixIcon={<MyIcon type='icon-riqi' />} />
          )}
        </FormItem>
        <FormItem label="描述" {...formLayout} className='u-mgb0'>
          {getFieldDecorator('description', {
            initialValue: item && item.description,
          })(
            <Input placeholder="请输入版本描述，不超过200字" className="f-fw" maxLength={200} />
          )}
        </FormItem>
      </Modal>

    </div>);
  }
}

export default Header;
