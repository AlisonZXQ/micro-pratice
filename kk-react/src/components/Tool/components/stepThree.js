import React, { Component } from 'react';
import { Button, Row, Table, message } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { getAdviseCustomList } from '@services/advise';
import { getRequirementCustomList } from '@services/requirement';
import { getTaskCustomList } from '@services/task';
import { getBugCustomList } from '@services/bug';
import { getObjectiveCustomList } from '@services/objective';
import { getTicketCustomList } from '@services/ticket';
import BusinessHOC from '@components/BusinessHOC';
import { adviseColumns, requirementColumns, taskColumns, bugColumns, objectiveColumns, ticketColumns } from '../shared/commonConfig';
import styles from './import.less';

class StepThree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      mapData: [
        { key: 'error', value: '系统处理异常数据如下' },
        { key: 'fail', value: '导入失败数据如下' },
        { key: 'incomplete', value: '不完整或格式非法数据如下' },
        { key: 'repeat', value: '重复数据如下' },
        { key: 'success', value: '成功导入数据如下' },
      ],
      columns: [],
    };
  }

  componentDidMount() {
    const { key } = this.props.type;
    const { id } = this.props.lastProduct;
    const params = {
      productid: id,
    };
    if (key === 'advise') {
      const newAdviseColumns = JSON.parse(JSON.stringify(adviseColumns));
      getAdviseCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newAdviseColumns.splice(newAdviseColumns.length - 1, 0, ...data);
        this.setInitValue(newAdviseColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (key === 'requirement') {
      const newRequirementColumns = JSON.parse(JSON.stringify(requirementColumns));
      getRequirementCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newRequirementColumns.splice(newRequirementColumns.length - 1, 0, ...data);
        this.setInitValue(newRequirementColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (key === 'task') {
      const newTaskColumns = JSON.parse(JSON.stringify(taskColumns));
      getTaskCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newTaskColumns.splice(newTaskColumns.length - 1, 0, ...data);
        this.setInitValue(newTaskColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (key === 'bug') {
      const newBugColumns = JSON.parse(JSON.stringify(bugColumns));
      getBugCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newBugColumns.splice(newBugColumns.length - 1, 0, ...data);
        this.setInitValue(newBugColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (key === 'objective') {
      const newObjectiveColumns = JSON.parse(JSON.stringify(objectiveColumns));
      getObjectiveCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newObjectiveColumns.splice(newObjectiveColumns.length - 1, 0, ...data);
        this.setInitValue(newObjectiveColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (key === 'ticket') {
      const newTicketColumns = JSON.parse(JSON.stringify(ticketColumns));
      getTicketCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newTicketColumns.splice(newTicketColumns.length - 1, 0, ...data);
        this.setInitValue(newTicketColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.thirdList !== nextProps.thirdList) {
      this.setState({ data: nextProps.thirdList });
    }
  }

  setInitValue = (newColumns) => {
    const arr = [];
    newColumns.map((item) => {
      if (item.key === 'message') {
        arr.push({
          title: item.value,
          dataIndex: item.key,
          key: item.key,
          render: (text, record) => {
            if (record.message) {
              return (
                <span style={{ color: '#F04646' }}>{record.message}</span>
              );
            } else if (record.missFields && record.missFields.length !== 0) {
              return (
                <span style={{ color: '#F04646' }}>缺少必填字段：{record.missFields.map((item) => (
                  <span>{item} </span>
                ))}</span>
              );
            } else {
              return <div style={{ minWidth: '50px' }}></div>;
            }
          }
        });
      } else if (item.name) { //自定义字段
        const { id, name } = item;
        arr.push({
          title: name,
          dataIndex: id,
          key: id,
          render: (text, record) => {
            return <span className='f-ib' style={{ minWidth: '100px' }}>
              {record.customfieldList4excel && record.customfieldList4excel[id]}
            </span>;
          }
        });
      } else if (item.key === 'jirakey4excel' && this.props.isBusiness) {
        return;
      } else {
        arr.push({
          title: item.value,
          dataIndex: item.key,
          key: item.key,
          render: (text, record) => {
            return <span className='f-ib' style={{ minWidth: '100px' }}>
              {text}
            </span>;
          }
        });
      }
    });
    this.setState({ columns: arr });
  }

  setCurrent = (val) => {
    if (val === 0) {
      this.props.setCurrent(val);
    } else if (val === -1) {
      // history.push('/advise/list');
      router.go(-1);
    }
  }

  render() {
    const { data, mapData } = this.state;
    const failCount = data.error && data.error.length + data.fail && data.fail.length + data.incomplete && data.incomplete.length + data.repeat && data.repeat.length;
    return (<div className={styles.contentSecond}>
      <div className={styles.tip}>
        共成功导入<span>{(data && data.sucessCount) || 0}</span>条，
        不可导入<span>{failCount || 0}</span>条
      </div>
      <div className={styles.warningTip}>
        未导入数据情况如下：
        <span>{(data && data.repeat && data.repeat.length) || 0}</span>条重复，
        <span>{(data && data.incomplete && data.incomplete.length) || 0}</span>条数据不完整或格式不合法，
        <span>{(data && data.error && data.error.length) || 0}</span>条系统处理异常，
        <span>{(data && data.fail && data.fail.length) || 0}</span>条导入失败
      </div>

      {mapData.map((item) => (
        data && data[item.key] && !!data[item.key].length && <Row>
          <span className={styles.title}>{item.value}</span>
          <Table
            className={styles.table}
            dataSource={data[item.key]}
            columns={this.state.columns} />
        </Row>
      ))}

      {/* <Row>
        <span className={styles.title}>导入失败数据如下</span>
        <Table
          className={styles.table}
          dataSource={dataSource}
          columns={columns}
          pagination={dataSource.length>10 ? true : false} />
      </Row> */}
      <Row style={{ marginTop: '40px' }} className='f-tar'>
        <Button type='primary' onClick={() => this.setCurrent(-1)}>返回列表查看</Button>
        <Button className='u-mgl10' onClick={() => this.setCurrent(0)}>继续导入</Button>
      </Row>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(BusinessHOC()(StepThree));
