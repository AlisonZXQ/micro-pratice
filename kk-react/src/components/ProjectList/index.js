import React, { Component } from "react";
import { Link } from 'umi';
import { history } from 'umi';
import { Breadcrumb, Dropdown, Menu, message } from 'antd';
import MyIcon from '@components/MyIcon';
import img from '@assets/tou.jpg';
import { queryProjectList } from '@services/project';
import styles from './index.less';

const MenuItem = Menu.Item;
const style = {
  height: '250px',
  overflow: 'auto',
};

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleDrop: false,
      projectList: [],
    };
  }

  componentDidMount() {
    this.getProjectList();
  }

  getProjectList = () => {
    const params = {
      order: 2,
      orderField: 1,
      pageSize: 300,
      pageNo: 1,
    };
    queryProjectList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询项目列表失败, ${res.msg}`);
      }
      this.setState({
        projectList: res.result.list || [],
      });
    }).catch((err) => {
      return message.error(`查询项目列表异常, ${err || err.message}`);
    });
  }

  menu = () => {
    const { id } = this.props;
    const { projectList } = this.state;
    const len = projectList && projectList.length;
    let filterList = projectList;
    if (id) {
      filterList = projectList.filter(it => it.id !== Number(id));
    }
    return (
      <Menu>
        <div className={styles.projectMenu} style={(len && len > 10) ? style : null}>
          {
            filterList && filterList.map(item => (
              <Link to={`/project/project_week_report/list?id=${item.id}`} target="_blank">
                <div
                  onClick={() => this.setState({ visibleDrop: false })}
                  className={styles.linkItem}
                  key={item.id}
                >
                  <img src={img} alt="头像" className={styles.pic} />
                  <span>
                    {item.title && item.title.length > 15 ? `${item.title.substring(0, 14)}...` : item.title}
                  </span>
                </div>
              </Link>
            ))
          }
        </div>
        {
          projectList && <Menu.Divider />
        }
        <MenuItem key="创建项目" className="u-mgl10">
          <a onClick={() => history.push('/project/create_project')}>+创建项目</a>
        </MenuItem>
      </Menu>);
  }

  handleVisibleChange = (flag) => {
    this.setState({ visibleDrop: flag });
  }
  render() {
    const { extra } = this.props;
    const { projectList } = this.state;
    const { id } = this.props;

    const data = projectList.find(it => it.id === Number(id)) || {};

    return (
      <Breadcrumb>
        <Breadcrumb.Item><Link to={'/project/list'}>项目列表</Link></Breadcrumb.Item>
        <Breadcrumb.Item>
          <Dropdown
            overlay={this.menu}
            onVisibleChange={this.handleVisibleChange}
            visible={this.state.visibleDrop}
          >
            <Link to={`/project/detail?id=${id}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }} onClick={() => this.setState({ visibleDrop: false })}>
                {
                  data.title && data.title.length > 15 ? `${data.title.substring(0, 14)}...` : data.title
                }
                <MyIcon type="icon-xia" style={{ fontSize: '6px', marginLeft: '2px' }} />
              </span>
            </Link>
          </Dropdown>
        </Breadcrumb.Item>
        {
          extra && extra.map(it => (
            <Breadcrumb.Item>
              {
                it.link ? <Link to={it.link}>{it.name}</Link> : it.name
              }
            </Breadcrumb.Item>
          ))
        }
      </Breadcrumb>
    );
  }
}

export default index;
