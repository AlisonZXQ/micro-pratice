import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { LinkOutlined } from '@ant-design/icons';
import { Button, Input, message, Tooltip } from 'antd';
import { history } from 'umi';
import { getCoreData } from '@services/login';
import BusinessHOC from '@components/BusinessHOC';
import logo from '@assets/logo.jpg';
import databg from '@assets/login/databg.png';
import hotline1 from '@assets/login/hotline1.png';
import hotline2 from '@assets/login/hotline2.png';
import popo from '@assets/login/popo.png';
import { DEFAULT_BANNER, DATA_DISPLAY, introduceMap } from '@shared/StaticPagesConfig';
import styles from './index.less';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showLine: false,
      groupNumber: 1502300, // popo交流群号
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    getCoreData().then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const obj = res.result;
      let data = [];
      data.push({ count: obj.userCount, label: '用户' });
      data.push({ count: obj.productCount, label: '产品' });
      data.push({ count: obj.subProductCount, label: '子产品' });
      data.push({ count: obj.projectCount, label: '项目' });
      data.push({ count: obj.objectiveCount, label: '目标' });
      data.push({ count: obj.adviseCount, label: '建议' });
      data.push({ count: obj.requirementCount, label: '需求' });
      this.setState({ data });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  doLogin = () => {
    history.push(`/my_workbench/advise`);
  }

  render() {
    const { groupNumber, data } = this.state;
    const { isBusiness } = this.props;
    return (
      <span>
        <div className={styles.banner}>
          <div className={styles.header}>
            <a style={{ margin: '18px 0px 0px 18px' }}>
              <img onClick={() => { history.push(`/my_workbench/advise`) }} src={logo} alt="logo" style={{ width: '150px' }} />
            </a>
          </div>

          <div className={styles.wrap}>
            <div className={styles.title}>
              EP(Easy Project)
            </div>
            <div className={styles.subtitle}>
              项目管理平台
            </div>
            <div className={styles.description}>
              针对不同业务形态的互联网产品，融合敏捷、精益产品、OKR管理等理念，并结合专业的项目管理方法论，打磨而成，助力企业提升效能、落地战略，实现产品业务的成功。
            </div>
            <div style={{ marginTop: '36px', paddingBottom: '80px' }}>
              <Button
                onClick={() => history.push(`/apply`)}
                style={{ width: '126px' }}>
                申请接入
              </Button>
              <Button
                style={{ width: '126px', marginLeft: '12px' }}
                onClick={() => this.doLogin()}
                type="primary">
                登录
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.introduce}>
          <div className={styles.wrap}>
            <div className={styles.introuceInfo}>
              <div className={styles.title}>
                多方面优势提升企业效能
              </div>
              <div className={styles.subtitle}>
                针对不同业务形态的互联网产品，针对每个不同需求，使团队和项目保持井然有序
              </div>
            </div>

            <div className={styles.introducePart}>
              {introduceMap.map((item, index) => (
                <div className={styles.content}>
                  <div
                    className={styles[`titleIcon${index + 1}`]}
                    style={{
                      backgroundSize: `${index === DEFAULT_BANNER.FULL_LINK ? '39px 41px' :
                        index === DEFAULT_BANNER.AUTO ? '56px 32px' :
                          index === DEFAULT_BANNER.OTHER ? '42px 43px' :
                            '47px 46px'
                      }`
                    }}
                  >
                  </div>
                  <div className={styles.title}>
                    {item.title}
                  </div>
                  <div className={styles.desc}>
                    {item.subTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.data}>
          <div className={styles.wrap}>
            <div className={styles.dataInfo}>
              <div className={styles.title}>
                海量数据，铸就强大平台
              </div>
              <div className={styles.subtitle}>
                针对不同业务形态的互联网产品，每个不同需求，使团队和项目保持井然有序
              </div>
            </div>

            <div className={styles.dataContent}>
              {data && data.map((item, index) => (
                <div className={styles.contentPart}>
                  <div className={styles[`count${index + 1}`]}>{item.count}</div>
                  <div className={styles.label}>{item.label}</div>
                </div>
              ))}

            </div>
          </div>
          <div className={styles.databg}>
            <img src={databg} />
          </div>
        </div>

        {!isBusiness && <div className={styles.product}>
          <div className={styles.wrap}>
            <div className={styles.productInfo}>
              <div className={styles.title}> 应用业务产品 </div>
              <div className={styles.subtitle}>
                多个部门以及产品使用EASY PROJECT，并通过各种反馈和数据通过迭代将产品变得更加完善
              </div>
            </div>

            <div className={styles.productContent}>
              {DATA_DISPLAY.map((item) => (
                <div className={styles[`contentPart${item}`]}></div>
              ))}
            </div>
          </div>
        </div>}

        <div className={styles.footer}>
          <div className={styles.wrap}>
            <div className={styles.wrap1}>
              立即来试用一下吧！
            </div>
            <div className={styles.wrap2}>
              更多功能持续迭代中...
            </div>
            <a
              onClick={() => this.doLogin()}
              className={styles.wrap3}>
              登录
            </a>
          </div>
        </div>

        {!isBusiness && <div className={styles.hotline}>
          {!this.state.showLine && <img
            onClick={() => this.setState({ showLine: true })}
            alt=""
            src={hotline1}
            style={{ width: '62px', cursor: 'pointer' }} />}
          {this.state.showLine && <img
            alt=""
            onClick={() => this.setState({ showLine: false })}
            src={hotline2}
            style={{ width: '62px', cursor: 'pointer' }} />}
          {this.state.showLine &&
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                服务与支持
              </div>
              <div className={styles.cardLine} style={{ marginTop: '-70px' }}>
                <div className={styles.name}>POPO交流群</div>
                <div className={styles.groupName}>群号:{groupNumber} </div>
                <CopyToClipboard
                  style={{ display: 'inline' }}
                  text={groupNumber}
                  onCopy={() => message.success('复制成功')}
                >
                  <Button type="primary"
                    className='u-mgt10'
                    icon={<LinkOutlined />}>复制号码</Button>
                </CopyToClipboard>
              </div>
              <div className={styles.cardLine}>
                <div className={styles.name}>联系POPO客服</div>
                <div style={{ position: 'relative' }}>
                  <Input style={{ marginTop: '12px' }} value='hzlibinbin@corp.netease.com' />
                  <Tooltip placement="topRight" title={'唤起泡泡联系客服'}>
                    <img
                      onClick={() => window.location.href = 'http://popo.netease.com/static/html/open_popo.html?ssid=hzlibinbin@corp.netease.com&sstp=0'}
                      src={popo}
                      className={styles.popo}
                      alt=""
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          }
        </div>}
      </span>
    );
  }
}

export default BusinessHOC()(Header);
