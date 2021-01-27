import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Col, Row } from 'antd';
import { withRouter } from 'react-router-dom';
import { Link } from 'umi';
import MyIcon from '@components/MyIcon';
import DefineDot from '@components/DefineDot';
import { statusColor, statusMap, priorityMap } from '@shared/ProjectConfig';
import { changeTypeMap } from '@pages/project/change_form/components/Config';
import styles from './index.less';

class ApprovalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      type: '',
      down: false,
    };
  }

  isEmptyData = (text) => {
    return text ? text : '-';
  }

  render() {
    const { list, title } = this.props;
    const { id } = this.props.location.query;
    // 级联字段
    const data = list || {};
    const projectDetail = data.projectDetail || {};

    let newString = data.reason ? data.reason : '-';
    // eslint-disable-next-line
    const pattern = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g;
    const arr = newString.match(pattern);
    if (arr && arr.length) {
      arr.forEach(it => {
        newString = newString.replace(it, '<a href="' + it + '" target=_blank>' + it + '</a>');
      });
    }

    return ([<Card className="btn98">
      <Col span={18}>
        <Row className="f-csp f-fs2">
          <Link to={`/project/detail?id=${id}`} className="u-subtitle">
            <span>
              <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
              返回项目
            </span>
          </Link>
        </Row>

        <Row className={`${styles.changeHeader} u-mgt10 u-mgb10`}>
          <MyIcon type="icon-danhaoicon" className={styles.icon} />{title}
        </Row>

        <Row className="u-mgb10 u-mgt10">
          <span className="u-title">变更类型：</span>
          <span className="f-fwb u-subtitle">{changeTypeMap[data.reasonType]}</span>
        </Row>
        <Row>
          <span className="u-title">变更原因：</span>
          <span dangerouslySetInnerHTML={{ __html: newString }} className="f-fwb u-subtitle" style={{ whiteSpace: 'pre-wrap' }}></span>
        </Row>
      </Col>

      <Col span={6}>
        <div style={{ position: 'absolute', right: '0px', width: 350 }}>
          <Row className="u-mgt40">
            <Col span={8} className="f-pr">
              <div className="f-fs2 u-thirdtitle f-fr f-clb">状态</div>
              <div className="u-mgt5 f-fs4 f-fr f-clb">
                {
                  projectDetail.status ?
                    <DefineDot
                      text={projectDetail.status}
                      statusMap={statusMap}
                      statusColor={statusColor}
                    />
                    : '-'
                }

              </div>
            </Col>
            <Col span={6}>
              <div className="f-fs2 u-thirdtitle f-fr f-clb">负责人</div>
              <span className="u-mgt5 f-fs4 f-fr f-clb f-wwb">{this.isEmptyData(projectDetail.owner)}</span>
            </Col>
            <Col span={6}>
              <div className="f-fs2 u-thirdtitle f-fr f-clb">优先级</div>
              <span className="u-mgt5 f-fs4 f-fr f-clb">{projectDetail.priority ? priorityMap[projectDetail.priority] : '-'}</span>
            </Col>
          </Row>
        </div>
      </Col>
    </Card>
    ]);
  }
}
export default withRouter(Form.create()(ApprovalHeader));
