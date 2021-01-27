import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Dropdown, Menu, Select, Input, message } from 'antd';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import { getAllTagList } from '@services/product_setting';
import { NO_OPT_PERMISSION_TIP_MSG } from '@shared/ReceiptConfig';
import { getIssueTagList, createIssueTag, removeIssueTag } from '@services/receipt';
import { connTypeIdMap, ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import { getIssueKey } from '@utils/helper';
import styles from './index.less';

const Option = Select.Option;

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputVal: '',
      searchVal: '',
      data: [],
      tagList: [],
      show: 'select',
      visible: false,
    };
    this.handleSearch = debounce(this.handleSearch, 800);
  }

  componentDidMount() {
    const { connid } = this.props;
    if (connid) {
      this.getDefaultData(connid);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.connid !== nextProps.connid) {
      this.getDefaultData(nextProps.connid);
    }
  }

  getDefaultData = (id) => {
    const { type } = this.props;
    const params = {
      conntype: type && RECEIPT_LOG_TYPE[type.toUpperCase()],
      connid: this.props.location.query[connTypeIdMap[type]] || id || this.props.connid,
    };
    getIssueTagList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const arr = [];
      res.result.forEach(it => {
        arr.push({
          id: it.tag.id,
          name: it.tag.name,
          relation: it.tagRelation.id,
        });
      });
      this.setState({ tagList: arr });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getData = (lastProduct) => {
    const product = lastProduct || this.props.lastProduct;
    const params = {
      productid: product.id,
    };
    getAllTagList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取标签列表失败, ${res.msg}`);
      }
      this.setState({ data: res.result || [] });
    }).catch((err) => {
      return message.error('获取标签列表异常', err || err.msg);
    });
  }

  handleSearch = (value) => {
    this.setState({ searchVal: value }, () => this.getData());
  }

  handleChange = (value, data) => {
    const { lastProduct, type, form: { setFieldsValue }, connid } = this.props;
    const params = {
      productid: lastProduct.id,
      name: data.props.data.name,
      conntype: RECEIPT_LOG_TYPE[type.toUpperCase()],
      connid: getIssueKey() || connid,
    };
    this.createIssueTag(params);
    setFieldsValue({ tag: '' });
  }

  handleCreate = () => {
    this.setState({ visible: false, show: 'select' });
    const { lastProduct, type, connid } = this.props;
    const params = {
      productid: lastProduct.id,
      name: this.state.inputVal,
      conntype: RECEIPT_LOG_TYPE[type.toUpperCase()],
      connid: getIssueKey() || connid,
    };
    this.createIssueTag(params);
  }

  createIssueTag = (params) => {
    createIssueTag(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`添加失败, ${res.msg}`);
      }
      message.success('添加成功！');
      this.getData();
      this.getDefaultData();
    }).catch((err) => {
      return message.error('添加异常', err || err.msg);
    });
  }

  dltTag = (item) => {
    const { issueRole } = this.props;
    if (issueRole === ISSUE_ROLE_VALUE_MAP.READ) {
      return message.error(NO_OPT_PERMISSION_TIP_MSG);
    }
    removeIssueTag({ id: item.relation }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('移除标签成功！');
      this.getDefaultData();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  addTag = () => {
    return (
      <span>
        <div className='f-jcsb-aic'>
          <MyIcon className='f-csp' onClick={() => this.setState({ show: 'select' })} type='icon-fanhuitubiao' />
          <span>新建标签</span>
          <CloseOutlined onClick={() => this.setState({ visible: false })} className='f-csp' />
        </div>
        <Input
          className='u-mgt10'
          onChange={e => this.setState({ inputVal: e.target.value })}
          placeholder='请输入标签名称' />
        <Button
          style={{ width: '100%' }}
          className='u-mgt10'
          onClick={() => this.handleCreate()}
          type='primary'>
          创建
        </Button>
      </span>
    );
  }

  selectPanel = () => {
    const { data } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    return (<span>
      {getFieldDecorator('tag', {
        initialValue: [],
      })(
        <Select
          showSearch
          style={{ width: '200px', }}
          placeholder="请搜索标签"
          showArrow
          optionFilterProp="children"
          onSelect={(value, data) => this.handleChange(value, data)}
        >
          {
            data && data.map(it => (
              <Option key={it.id} value={it.id} data={it}>{it.name}</Option>
            ))
          }
        </Select>
      )}
      <MyIcon
        onClick={() => this.setState({ show: 'create' })}
        type='icon-tianjiabiaoqian'
        className={styles.tagIcon} />
    </span>);
  }

  content = () => {
    const { show } = this.state;
    return (
      <Menu style={{ position: 'relative', padding: '10px' }}>
        {show === 'select' ? this.selectPanel() : this.addTag()}
      </Menu>
    );
  }

  render() {
    const { issueRole } = this.props;
    const { tagList, visible } = this.state;

    return (
      <div>
        {tagList && tagList.map((item) => (
          <span className={styles.tag}>
            {item.name}
            <CloseOutlined
              style={{ fontSize: '10px' }}
              className='u-mgl5 f-csp'
              onClick={(e) => { this.dltTag(item, e) }} />
          </span>
        ))}

        {
          issueRole === ISSUE_ROLE_VALUE_MAP.READ ?
            <Button
              type='dashed'
              icon={<PlusOutlined />}
              disabled
            >
              点击添加
            </Button>
            :
            <Dropdown
              overlay={this.content()}
              trigger={['click']}
              visible={visible}
              onVisibleChange={(visible) => this.setState({ visible })}
            >
              <Button
                type='dashed'
                icon={<PlusOutlined />}
                onClick={(e) => { e.stopPropagation(); this.getData() }}
              >
                点击添加
              </Button>
            </Dropdown>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(Index)));
