import React, { Component } from 'react';
import { Button, Row, Table, message } from 'antd';
import { connect } from 'dva';
import { importAdviseFile, getAdviseCustomList } from '@services/advise';
import { importRequirementFile, getRequirementCustomList } from '@services/requirement';
import { importTaskFile, getTaskCustomList } from '@services/task';
import { importBugFile, getBugCustomList } from '@services/bug';
import { importObjectiveFile, getObjectiveCustomList } from '@services/objective';
import { importTicketFile, getTicketCustomList } from '@services/ticket';
import BusinessHOC from '@components/BusinessHOC';
import { adviseColumns, requirementColumns, taskColumns, bugColumns, objectiveColumns, ticketColumns } from '../shared/commonConfig';
import styles from './import.less';

class StepTwo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      mapData: [
        { key: 'error', value: '以下为系统处理异常数据' },
        { key: 'incomplete', value: '以下为不完整或格式非法数据' },
        { key: 'repeat', value: '以下为重复数据' },
        { key: 'success', value: '以下为可导入数据' },
      ],
      columns: [],
    };
  }

  componentDidMount(){
    const { key } = this.props.type;
    const { id } = this.props.lastProduct;
    const params = {
      productid: id,
    };
    if(key === 'advise') {
      const newAdviseColumns = JSON.parse(JSON.stringify(adviseColumns));
      getAdviseCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newAdviseColumns.splice(newAdviseColumns.length-1, 0, ...data);
        this.setInitValue(newAdviseColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }else if(key === 'requirement') {
      const newRequirementColumns = JSON.parse(JSON.stringify(requirementColumns));
      getRequirementCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newRequirementColumns.splice(newRequirementColumns.length-1, 0, ...data);
        this.setInitValue(newRequirementColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }else if(key === 'task') {
      const newTaskColumns = JSON.parse(JSON.stringify(taskColumns));
      getTaskCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newTaskColumns.splice(newTaskColumns.length-1, 0, ...data);
        this.setInitValue(newTaskColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }else if(key === 'bug') {
      const newBugColumns = JSON.parse(JSON.stringify(bugColumns));
      getBugCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newBugColumns.splice(newBugColumns.length-1, 0, ...data);
        this.setInitValue(newBugColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }else if(key === 'objective') {
      const newObjectiveColumns = JSON.parse(JSON.stringify(objectiveColumns));
      getObjectiveCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newObjectiveColumns.splice(newObjectiveColumns.length-1, 0, ...data);
        this.setInitValue(newObjectiveColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }else if(key === 'ticket') {
      const newTicketColumns = JSON.parse(JSON.stringify(ticketColumns));
      getTicketCustomList(params).then((res) => { //获取自定义字段
        if (res.code !== 200) { return message.error(res.msg) }
        const data = res.result;
        newTicketColumns.splice(newTicketColumns.length-1, 0, ...data);
        this.setInitValue(newTicketColumns);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.secondList !== nextProps.secondList) {
      this.setState({ data: nextProps.secondList });
    }
  }

  setInitValue = (newColumns) => {
    const arr = [];
    newColumns.map((item) => {
      if(item.key === 'message'){
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
            }else {
              return <div style={{minWidth: '50px'}}></div>;
            }
          }
        });
      }else if(item.name) { //自定义字段
        const { id, name } = item;
        arr.push({
          title: name,
          dataIndex: id,
          key: id,
          width: 200,
          render: (text, record) => {
            return <span className='f-ib' style={{minWidth: '100px'}}>
              {record.customfieldList4excel && record.customfieldList4excel[id]}
            </span>;
          }
        });
      }else if(!(item.key === 'jirakey4excel' && this.props.isBusiness)){
        arr.push({
          title: item.value,
          dataIndex: item.key,
          key: item.key,
          render: (text, record) => {
            return <span className='f-ib' style={{minWidth: '100px'}}>
              {text}
            </span>;
          }
        });
      }
    });
    this.setState({ columns: arr });
  }

  setCurrent = (val, data) => {
    if(val === 0) {
      this.props.setCurrent(val);
    }else if( val === 2){
      this.nextStep(val, data);
    }
  }

  nextStep = (val, data) => {
    const params = {
      success: data
    };

    const { key } = this.props.type;
    if(key === 'advise'){
      importAdviseFile(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.setCurrent(val, res.result);
        message.success(`导入成功`);
      }).catch((err) => {
        return message.error(`${err || err.msg}导入文件异常`);
      });
    }else if(key === 'requirement') {
      importRequirementFile(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.setCurrent(val, res.result);
        message.success(`导入成功`);
      }).catch((err) => {
        return message.error(`${err || err.msg}导入文件异常`);
      });
    }
    else if(key === 'task') {
      importTaskFile(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.setCurrent(val, res.result);
        message.success(`导入成功`);
      }).catch((err) => {
        return message.error(`${err || err.msg}导入文件异常`);
      });
    }
    else if(key === 'bug') {
      importBugFile(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.setCurrent(val, res.result);
        message.success(`导入成功`);
      }).catch((err) => {
        return message.error(`${err || err.msg}导入文件异常`);
      });
    }
    else if(key === 'objective') {
      importObjectiveFile(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.setCurrent(val, res.result);
        message.success(`导入成功`);
      }).catch((err) => {
        return message.error(`${err || err.msg}导入文件异常`);
      });
    }
    else if(key === 'ticket') {
      importTicketFile(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.setCurrent(val, res.result);
        message.success(`导入成功`);
      }).catch((err) => {
        return message.error(`${err || err.msg}导入文件异常`);
      });
    }

  }

  render() {
    const { data, mapData } = this.state;

    return (<div className={styles.contentSecond}>
      <div className={styles.tip}>
        文件中包含<span>{(data && data.summary && data.summary.total) || 0}</span>条数据，
        其中可导入<span>{(data && data.summary && data.summary.success) || 0}</span>条，
        不可导入<span>{(data && data.summary && data.summary.failure) || 0}</span>条
      </div>
      <div className={styles.warningTip}>
        包含<span>{(data && data.summary && data.summary.repeat) || 0}</span>条重复，
        <span>{(data && data.summary && data.summary.incomplete) || 0}</span>条数据不完整或格式不合法，
        <span>{(data && data.summary && data.summary.error) || 0}</span>条系统处理异常
      </div>

      {mapData.map((item) => (
        data && data[item.key] && !!data[item.key].length && <Row>
          <span className={styles.title}>{item.value}</span>
          <Table
            className={styles.table}
            dataSource={data[item.key]}
            columns={ this.state.columns } />
        </Row>
      ))}

      <Row style={{ marginTop: '40px' }} className='f-tar'>
        <Button type='primary'disabled={data && data.success && !data.success.length} onClick={() => this.setCurrent(2, data.success)}>确认并导入可用数据</Button>
        <Button className='u-mgl10' onClick={() => this.setCurrent(0)}>重新选择</Button>
      </Row>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(BusinessHOC()(StepTwo));
