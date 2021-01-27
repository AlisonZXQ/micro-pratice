import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  message,
  Input,
  Checkbox,
  Radio,
  Select,
  Divider,
  InputNumber,
  Popover,
  DatePicker,
  Modal,
  Button,
  Card,
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import TinyMCE from '@components/TinyMCE';
import MyIcon from '@components/MyIcon';
import BusinessHOC from '@components/BusinessHOC';
import CloudCC from '@pages/receipt/components/CloudCC';
import CloudccInfoDialog from '@components/CloudccInfoDialog';
import { estimateCost, getLinkableContent, getCloudccRichValue } from '@utils/helper';
import { CUSTOME_TYPE_MAP, CUSTOME_REQUIRED } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import ViewImage from './components/ViewImage';

import styles from './index.less';

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

const isEmpty = (text) => {
  return text ? text : '-';
};

/**
 * @type rich integer标记字段类型
 * @editType 标记编辑类型，比如detail_rich和drawer_rich标记rich类型下的两种来源
 * @data 自定义字段的对象
 */
class index extends Component {
  state = {
    edit: false,
    visible: false,
    fullViewVisible: false,
    editFullView: false,
    imageSrc: '',
  }
  divElement = null;
  datePickerElement = null;
  cloudccInfoDialogRef = null;

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.drawerIssueId !== nextProps.drawerIssueId) {
      this.setState({ edit: false });
    }
  }

  getInitialValue = () => {
    const { type, value, currentId, customSelect, data } = this.props;

    if (type === 'rich') {
      this.props.dispatch({ type: 'design/saveDes', payload: value });
      return value ? value : '';
    } else if (type === 'radio' || type === 'multiSelect' || type === "checkbox") {
      return currentId;
    } else if (type === 'select') {
      const selectData = customSelect[data.id];
      return selectData.some(it => it.id === Number(currentId)) ? currentId : undefined;
    } else if (type === 'integer' || type === 'decimal') {
      return value && typeof value === 'number' ? value : 0;
    } else if (type === 'datePicker') {
      return value ? moment(value) : undefined;
    } else {
      return value;
    }
  }

  handleSave = () => {
    const { required, form: { getFieldValue }, data, editType } = this.props;
    let editIssue = getFieldValue('editIssue');
    if (editType && editType === 'cost' && estimateCost(editIssue)) {
      return message.warn('预估工作量格式不合法！');
    }

    if (required || (data && data.required === CUSTOME_REQUIRED.REQUIRED)) {
      if (!editIssue || (data.type === CUSTOME_TYPE_MAP.MULTISELECT && !editIssue.length)) {
        return message.warn('此项必填！');
      } else {
        this.setState({ edit: false });
        this.props.handleUpdate(editIssue);
      }
    } else {
      this.setState({ edit: false });
      this.props.handleUpdate(editIssue);
    }
  }

  showCloudccDialog = (e) => {
    if (e.target.tagName !== 'A') {
      return;
    }
    this.cloudccInfoDialogRef.setState({ visible: true });
    this.cloudccInfoDialogRef.getCloudccInfo();
  }

  /**
   * 展示态的数据
   */
  getDisplayText = () => {
    const { type, value, data, issueRole, editType } = this.props;
    const hasEditAccess = issueRole !== ISSUE_ROLE_VALUE_MAP.READ;
    const text = isEmpty(data && data.productCustomFieldValueVOList && data.productCustomFieldValueVOList[0] && data.productCustomFieldValueVOList[0].customlabel);

    let richValue = value ? value : '请输入';
    if (type === 'radio' || type === 'checkbox' || type === 'multiSelect' || type === 'datePicker' || type === 'select') {
      richValue = value ? value : '请选择';
    }
    if (type === 'rich') {
      richValue = value && value !== '<p></p>' ? value : '请输入';
    }
    if (type === 'integer') {
      richValue = value ? `${value}（${text}）` : '请输入';
    }
    if (type === 'decimal') {
      richValue = value ? `${value}（${text}）` : '请输入';
    }

    if (hasEditAccess) {
      switch (type) {
        case 'input':
          return (
            <Popover
              content={<div dangerouslySetInnerHTML={{ __html: getLinkableContent(richValue) }} />}
            >
              <div
                className={`editIssue u-subtitle f-toe ${value ? '' : styles.noTextColor}`}
                onClick={() => this.setState({ edit: true })}
              >{richValue}
              </div>
            </Popover>
          );
        case 'integer':
        case 'decimal':
          return (
            <div
              className={`editIssue u-subtitle ${value ? '' : styles.noTextColor}`}
              onClick={() => this.setState({ edit: true })}
              style={{ wordBreak: 'break-all' }}
            >{richValue}
            </div>);
        case 'textArea':
        case 'rich':
          return (
            <div className={styles.richContainer}>
              <div
                dangerouslySetInnerHTML={{ __html: richValue }}
                style={{ overflow: 'auto', height: 'auto', minHeight: '120px' }}
                className={`${styles.rich} ${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
                onClick={(e) => {
                  if (e.target.tagName.toLowerCase() === 'img' && e.target.src) {
                    this.setState({ imageSrc: e.target.src });
                  } else {
                    this.setState({ edit: true });
                  }
                }}
              />
              <span
                className={styles.editIcon}
                onClick={(e) => { e.stopPropagation(); this.setState({ edit: true }) }}
              >
                <MyIcon type="icon-bianji1" />
              </span>

              <span
                className={styles.fullViewIcon}
                onClick={(e) => { e.stopPropagation(); this.setState({ fullViewVisible: true }) }}
              >
                <MyIcon type='icon-quanping1' />
              </span>
            </div>
          );
        case 'radio':
        case 'select':
          return (
            this.props.cloudccId ?
              <Popover
                content={<div onClick={(e) => { e.stopPropagation(); this.showCloudccDialog(e) }} dangerouslySetInnerHTML={{ __html: getCloudccRichValue(richValue) }} />}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: richValue }}
                  className={`editIssue ${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
                  style={{ overflow: 'auto' }}
                  onClick={() => this.setState({ edit: true })}
                />
              </Popover>
              :
              <div
                dangerouslySetInnerHTML={{ __html: richValue }}
                className={`editIssue ${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
                style={{ overflow: 'auto' }}
                onClick={() => this.setState({ edit: true })}
              />
          );
        case 'checkbox':
        case 'multiSelect':
          return (
            <div
              dangerouslySetInnerHTML={{ __html: richValue }}
              className={`editIssue ${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
              style={{ overflow: 'auto' }}
              onClick={() => this.setState({ edit: true })}
            />
          );
        case 'datePicker':
          return (<div
            className={`editIssue u-subtitle`}
            style={{ wordBreak: 'break-all' }}
            onClick={() => this.setState({ edit: true })}
          >{richValue ? moment(richValue).format('YYYY-MM-DD') : <span className="u-placeholder">请选择</span>}
          </div>);
        default: return null;
      }
    } else {
      switch (type) {
        case 'input':
          return (
            <Popover
              content={<div dangerouslySetInnerHTML={{ __html: getLinkableContent(richValue) }} />}
            >
              <div
                className={`u-subtitle f-toe ${value ? '' : styles.noTextColor}`}
              >{richValue}
              </div>
            </Popover>
          );
        case 'integer':
        case 'decimal':
          return (
            <div
              className={`u-subtitle ${value ? '' : styles.noTextColor}`}
              style={{ wordBreak: 'break-all' }}
            >{richValue}
            </div>);
        case 'textArea':
        case 'rich':
          return (<div className={styles.richContainer}>
            <div
              dangerouslySetInnerHTML={{ __html: richValue }}
              style={{ overflow: 'auto', height: editType === 'detail_rich' ? '200px' : '120px' }}
              className={`${styles.disabledRich} ${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
              onClick={(event) => {
                if (event.target.tagName.toLowerCase() === 'img' && event.target.src) {
                  this.setState({ imageSrc: event.target.src });
                }
              }}
            />
            <span
              className={styles.fullViewIcon}
              onClick={(e) => { e.stopPropagation(); this.setState({ fullViewVisible: true }) }}
            >
              <MyIcon type='icon-quanping1' />
            </span>
          </div>);
        case 'radio':
        case 'select':
          return (
            this.props.cloudccId ?
              <Popover
                content={<div onClick={(e) => { e.stopPropagation(); this.showCloudccDialog(e) }} dangerouslySetInnerHTML={{ __html: getCloudccRichValue(richValue) }} />}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: richValue }}
                  className={`${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
                  style={{ overflow: 'auto' }}
                />
              </Popover>
              :
              <div
                dangerouslySetInnerHTML={{ __html: richValue }}
                className={`${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
                style={{ overflow: 'auto' }}
              />
          );
        case 'checkbox':
        case 'multiSelect':
          return (
            <div
              dangerouslySetInnerHTML={{ __html: richValue }}
              className={`${type === 'rich' ? '' : 'u-subtitle'} ${value ? '' : styles.noTextColor}`}
              style={{ overflow: 'auto' }}
            />
          );
        case 'datePicker':
          return (<div
            className={`u-subtitle`}
            style={{ wordBreak: 'break-all' }}
          >{richValue ? moment(richValue).format('YYYY-MM-DD') : <span className="u-placeholder">请选择</span>}
          </div>);
        default: return null;
      }
    }
  }

  /**
   * 默认值的设置，对于单选和多选
   */
  setDefaultValue = (it, id, selectMap, type) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;
    if (type === 'select') {
      setFieldsValue({ editIssue: id });
    } else if (type === 'multiSelect') {
      const ids = getFieldValue('editIssue') || [];
      ids.push(id);
      setFieldsValue({ editIssue: ids });
    }
  }

  getConcatData = (data) => {
    const { customSelect } = this.props;
    return (customSelect && data && customSelect[data.id]) || [];
  }

  /**
   * 不同类型对应的组件
   */
  getComponent = () => {
    const { type, dataSource, required, form: { setFieldsValue }, data, isBusiness, editType } = this.props;
    if (type === 'rich' || type === 'textArea') {
      return <TinyMCE placeholder="请输入" height={editType === 'detail_rich' ? 290 : 170} />;
    } else if (type === 'input') {
      return <Input onPressEnter={(e) => this.handleSave()} />;
    } else if (type === 'radio') {
      return <RadioGroup>
        {required === false &&
          <a onClick={() => setFieldsValue({ editIssue: 0 })}>清空已有选项</a>
        }
        {
          dataSource.map(it =>
            <Radio key={it.id} value={it.id}>
              {it.customlabel}
            </Radio>)
        }
      </RadioGroup>;
    } else if (type === 'select') {
      return (<Select
        showSearch
        optionFilterProp="children"
        showArrow
        className="f-fw"
        notFoundContent={'暂无数据'}
        dropdownRender={(menu) => (
          <div>
            {
              data && data.cloudcc_field && data.cloudcc_key && !isBusiness &&
              <div
                style={{ padding: '4px 8px', cursor: 'pointer' }}
                onMouseDown={e => e.preventDefault()}
              >
                没找到想要的?
                <CloudCC data={data} handleSave={(id, selectMap) => this.setDefaultValue(data, id, selectMap, 'select')} />
              </div>
            }
            {menu}
          </div>
        )}
      >
        {
          this.getConcatData(data).map(it =>
            <Option key={it.id} value={it.id}>
              {it.customlabel}
            </Option>)
        }
      </Select>);
    } else if (type === 'checkbox') {
      return <CheckboxGroup>
        {
          dataSource.map(it =>
            <Checkbox key={it.id} value={it.id} style={{ marginLeft: '8px' }}>
              {it.customlabel}
            </Checkbox>)
        }
      </CheckboxGroup>;
    } else if (type === 'multiSelect') {
      return <Select
        showSearch
        optionFilterProp="children"
        mode="multiple"
        showArrow
        className="f-fw"
        notFoundContent={'暂无数据'}
        dropdownRender={(menuRender) => (
          <div>
            {
              data && data.cloudcc_field && data.cloudcc_key && !isBusiness &&
              <div
                style={{ padding: '4px 8px', cursor: 'pointer' }}
                onMouseDown={e => e.preventDefault()}
              >
                没找到想要的?
                <CloudCC data={data} handleSave={(id, selectMap) => this.setDefaultValue(data, id, selectMap, 'multiSelect')} />
              </div>
            }
            {menuRender}
          </div>
        )}
      >
        {
          this.getConcatData(data).map(item => <Option key={item.id} value={item.id}>
            {item.customlabel}
          </Option>)
        }
      </Select>;
    } else if (type === 'integer') {
      return <InputNumber
        precision={0}
        min={0}
        onPressEnter={(e) => this.handleSave()}
      />;
    } else if (type === 'decimal') {
      return <InputNumber
        step={0.1}
        onPressEnter={(e) => this.handleSave()}
      />;
    } else if (type === 'datePicker') {
      return <DatePicker
        className={styles.datePicker}
        placeholder="点击选择日期"
        suffixIcon={<MyIcon type='icon-xia' className={styles.datePickerIcon} />}
        getCalendarContainer={() => document.getElementById('edit_issue_container')}
      />;
    }
  }

  closeFullView = () => {
    this.setState({ fullViewVisible: false, editFullView: false });
    const { form: { setFieldsValue }, value } = this.props;
    setFieldsValue({ editIssue: value });
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue, setFieldsValue }, data, type, value, cloudccId, issueRole } = this.props;
    const { edit, visible, fullViewVisible, editFullView, imageSrc } = this.state;
    const text = isEmpty(data && data.productCustomFieldValueVOList && data.productCustomFieldValueVOList[0] && data.productCustomFieldValueVOList[0].customlabel);
    let productid = data && data.productid ? data.productid : 0;
    let cloudcc_key = data && data.cloudcc_key ? data.cloudcc_key : '';
    let richValue = value && value !== '<p></p>' ? value : '';
    const hasEditAccess = issueRole !== ISSUE_ROLE_VALUE_MAP.READ;

    return (<span className={styles.container} id="edit_issue_container">
      {
        imageSrc &&
        <ViewImage
          imageSrc={imageSrc}
          handleClose={() => this.setState({ imageSrc: '' })}
          richValue={richValue}
        />
      }
      <Modal
        footer={<span>
          {editFullView
            ?
            <span>
              <Button onClick={() => this.closeFullView()}>取消</Button>
              <Button type='primary' onClick={() => { this.handleSave(); this.closeFullView() }}>保存</Button>
            </span>
            :
            hasEditAccess &&
            <Button type='primary' onClick={() => {
              this.setState({ editFullView: true, edit: true });
              setFieldsValue({ editIssue: value });
            }}>编辑</Button>
          }
        </span>}
        wrapClassName={styles.fullViewModal}
        onCancel={() => this.closeFullView()}
        title='全屏查看'
        visible={fullViewVisible}>
        <div
          className={styles.fullViewContainer}
        >
          {editFullView
            ?
            <span>
              <TinyMCE
                placeholder="请输入"
                height={"calc(100vh - 182px)"}
                fullModalChange={(value) => setFieldsValue({ editIssue: value })}
                value={getFieldValue('editIssue')}
              />
            </span>
            :
            <div
              dangerouslySetInnerHTML={{ __html: richValue }}
            />
          }
        </div>
      </Modal>

      {
        !edit &&
        this.getDisplayText()
      }

      {
        edit &&
        [
          <div
            ref={node => this.divElement = node}
          >
            {
              getFieldDecorator('editIssue', {
                initialValue: this.getInitialValue(),
              })(
                this.getComponent()
              )
            }
            {
              data && (data.type === CUSTOME_TYPE_MAP.INTERGER || data.type === CUSTOME_TYPE_MAP.DECIMAL) &&
              <span className="f-fs2 u-subtitle">{text}</span>
            }
          </div>,
          <div>
            {
              !(type === 'rich' || type === 'textArea') &&
              <span>
                <a size="small" type="primary" onClick={() => this.handleSave()}>保存</a>
                <Divider type="vertical" />
                <a size="small" onClick={() => { this.setState({ edit: false }); setFieldsValue({ editIssue: value }) }}>取消</a>
              </span>
            }

            {
              (type === 'rich' || type === 'textArea') &&
              <div className="u-mgt10 btn98">
                <Button
                  onClick={() => this.setState({ visible: true })}
                  style={{ width: '105px' }}
                >
                  <MyIcon type="icon-quanping" />
                  <span>全屏编辑</span>
                </Button>
                <span className="f-fr">
                  <Button className="u-mgr10" onClick={() => { this.setState({ edit: false }); setFieldsValue({ editIssue: value }) }}>取消</Button>
                  <Button type="primary" onClick={() => this.handleSave()}>保存</Button>
                </span>
              </div>
            }
          </div>]
      }

      <Modal
        title="全屏编辑"
        visible={visible}
        wrapClassName={styles.fullModal}
        closable={false}
        footer={null}
      >
        <Card>
          <TinyMCE
            placeholder="请输入"
            height={"calc(100vh - 120px)"}
            fullModalChange={(value) => setFieldsValue({ editIssue: value })}
            value={getFieldValue('editIssue')}
          />
          <div className="f-tar u-mgr10 u-mgt5 u-mgb5">
            <Button className="u-mgr10" onClick={() => { this.setState({ visible: false, edit: false }); setFieldsValue({ editIssue: value }) }}>取消</Button>
            <Button type="primary" onClick={() => { this.handleSave(); this.setState({ visible: false }) }}>保存</Button>
          </div>
        </Card>
      </Modal>

      <CloudccInfoDialog
        refThis={(ref) => this.cloudccInfoDialogRef = ref}
        productid={productid}
        cloudccId={cloudccId}
        cloudccTable={cloudcc_key}
      />
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default connect(mapStateToProps)(BusinessHOC()(Form.create()(index)));
