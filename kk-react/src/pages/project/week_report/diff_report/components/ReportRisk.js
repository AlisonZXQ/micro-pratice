import React, { Component } from 'react';
import { Tag, Table, Modal } from 'antd';
import TextOverFlow from '@components/TextOverFlow';
import DefineDot from '@components/DefineDot';
import { bugTaskNameMap, bugTaskColorDotMap } from '@shared/CommonConfig';
import { riskTypeStatusColorMap, riskTypeStatusMap, riskTypeColorMap, riskTypeNameMap } from '@shared/ProjectConfig';
import RiskTable from '../../../project_risk/components/RiskTable'; // 新建和编辑周报时直接可以编辑风险
import RiskForm from '../../../project_risk/components/RiskForm';

class ReportRisk extends Component {
  constructor(props) {
    super(props);
    this.state = {
      riskList: [],
      visible: false,
      record: {},
    };
    this.columns = [{
      title: '风险名称',
      dataIndex: 'name',
      width: 300,
      render: (text, record) => {
        return (<span>
          <TextOverFlow content={text} maxWidth={300} />
        </span>);
      }
    }, {
      title: '状态',
      dataIndex: 'state',
      render: (text, record) => {
        const statusMap = record.type ? bugTaskNameMap : riskTypeStatusMap;
        const statusColor = record.type ? bugTaskColorDotMap : riskTypeStatusColorMap;

        return (<DefineDot
          text={text}
          statusMap={statusMap}
          statusColor={statusColor}
        />);
      }
    }, {
      title: '风险等级',
      dataIndex: 'level',
      render: (text) => {
        return <Tag color={riskTypeColorMap[text]}>{riskTypeNameMap[text]}</Tag>;
      }
    }, {
      title: '负责人',
      dataIndex: 'responseUser',
      render: (text) => {
        return text ? text.name : '-';
      }
    }, {
      title: '创建人',
      dataIndex: 'createUser',
      render: (text) => {
        return text ? text.name : '-';
      }
    }];
  }

  componentDidMount() {
  }

  getData = (data) => {
    const dataSource = [];

    data && data.forEach(it => {
      dataSource.push({
        ...it.projectRisk,
        responseUser: it.responseUser,
        createUser: it.createUser,
      });
    });
    return dataSource;
  }

  render() {
    const { actionType, existList, reportId, projectId } = this.props;
    const { visible, record } = this.state;

    // 查看
    return (<span>
      {
        actionType === 'view' &&
        <div className="u-mg20" style={{ margin: '0px 20px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ margin: '12px 0px' }}>
            <span className='name'>项目风险</span>
          </div>
          <Table
            rowKey={record => record.id}
            className="bgWhiteModel"
            columns={this.columns}
            dataSource={this.getData(existList)}
            pagination={false}
            onRow={(record) => {
              return {
                className: 'f-csp',
                onClick: () => {
                  this.setState({ visible: true, record });
                }
              };
            }}
          />
          <Modal
            width={800}
            title={'查看风险'}
            visible={visible}
            footer={null}
            onCancel={() => this.setState({ visible: false, record: {} })}
            destroyOnClose
            maskClosable={false}
          >
            <RiskForm
              form={this.props.form}
              editData={record}
              view
            />
          </Modal>
        </div>
      }
      {/* 新建or编辑 */}
      {
        (actionType === 'create' || actionType === 'edit') &&
        <RiskTable
          title="项目风险"
          style={{ padding: '0px 20px' }}
          actionType={actionType}
          reportId={reportId}
          projectId={projectId}
          id={projectId}
        />
      }
    </span>);
  }
}

export default ReportRisk;
