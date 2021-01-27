import React, { Component } from 'react';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Dropdown, Menu, Select, Input, message } from 'antd';
import debounce from 'lodash/debounce';
import MyIcon from '@components/MyIcon';
import { getAllTagList, addTag } from '@services/product_setting';
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
      productid: 0,
    };
    this.handleSearch = debounce(this.handleSearch, 800);
  }

  componentDidMount() {
    if (this.props.productid) {
      this.setState({ productid: this.props.productid }, () => this.getData());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.productid !== nextProps.productid) {
      this.setState({ productid: nextProps.productid }, () => this.getData());
    }
  }

  getData = () => {
    const { productid } = this.state;
    const params = {
      productid: productid,
    };
    getAllTagList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取标签列表失败, ${res.msg}`);
      }
      this.setState({ data: res.result });
    }).catch((err) => {
      return message.error('获取标签列表异常', err || err.msg);
    });
  }

  handleSearch = (value) => {
    this.setState({ searchVal: value }, () => this.getData());
  }

  handleChange = (value) => {
    this.setState({ visible: false });
    const arr = this.state.tagList;
    if(arr.find(it => it.id === value)){
      message.warning('请勿重复添加！');
    }else {
      arr.push({
        id: value,
        name: value,
      });
    }

    this.setState({ tagList: arr });
  }

  handleCreate = () => {
    this.setState({ visible: false, show: 'select' });
    const { productid } = this.props;
    const params = {
      productid,
      name: this.state.inputVal,
    };
    addTag(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`添加失败, ${res.msg}`);
      }
      message.success('添加成功！');
      this.getData();
      const tag = res.result.tag;

      let data = this.props.form.getFieldValue('tagnames');
      data.push(tag.name);
      this.props.form.setFieldsValue({ tagnames: data });

      let arr = this.state.tagList;
      arr.push({
        id: tag.id,
        name: tag.name,
      });
      this.setState({ tagList: arr });
    }).catch((err) => {
      return message.error('添加异常', err || err.msg);
    });
  }

  dltTag = (item) => {
    const { tagList } = this.state;
    tagList && tagList.map((it, index) => {
      if (it.id === item.id) {
        tagList.splice(index, 1);
      }
    });
    this.setState({ tagList });

    let arr = [];
    tagList && tagList.map((it) => {
      arr.push(it.id);
    });
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ tagnames: arr });
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
    const { data, tagList } = this.state;
    let initData = [];
    tagList && tagList.map((item) => {
      initData.push(item.id);
    });
    const { form: { getFieldDecorator } } = this.props;
    return (<span>
      {getFieldDecorator('tagnames', {
        initialValue: initData,
      })(
        <Input style={{ display: 'none' }} />
      )}
      <Select
        style={{ width: '200px', }}
        placeholder="请搜索标签"
        optionLabelProp="label"
        showArrow
        onSearch={(value) => this.handleSearch(value)}
        value={undefined}
        onSelect={(value) => this.handleChange(value)}
      >
        {
          data && data.map(it => (
            <Option key={it.id} value={it.name} label={it.name}>{it.name}</Option>
          ))
        }
      </Select>
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
    const { tagList, visible } = this.state;
    return (
      <div>
        {tagList && tagList.map((item) => (
          <span className={styles.tag}>
            {item.name}
            <CloseOutlined
              style={{fontSize: '10px'}}
              className='u-mgl5 f-csp'
              onClick={(e) => { this.dltTag(item, e) }} />
          </span>
        ))}

        <Dropdown
          overlay={this.content()}
          trigger={['click']}
          visible={visible}
          onVisibleChange={(visible) => this.setState({ visible })}
        >
          <Button type='dashed' icon={<PlusOutlined />} onClick={(e) => { e.stopPropagation() }}>
            点击添加
          </Button>
        </Dropdown>
      </div>
    );
  }
}

export default Form.create()(Index);
