import React, { Component } from 'react';
import styles from './index.less';

class index extends Component {
  state = {
    current: 0,
    over: 0,
  }

  componentDidMount() {
    const { value } = this.props;
    if (value) {
      this.setState({ current: value });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (this.props.value !== nextProps.value) {
      this.setState({ current: value });
    }
  }

  getArr = () => {
    const { total } = this.props;
    const arr = [];
    let i = 1;
    while (i <= total) {
      arr.push(i);
      i++;
    }
    return arr;
  }

  handleClick = (it) => {
    const { onChange } = this.props;
    onChange(it);
    this.setState({ current: it });
  }

  handleMove = (it) => {
    this.setState({ over: it });
  }

  handleLeave = () => {
    this.setState({ over: 0 });
  }

  render() {
    const arr = this.getArr();
    const { current, over } = this.state;

    const now = over || current;

    return (<span>
      {
        arr.map((it, index) => (
          <div 
            onClick={() => this.handleClick(it)}
            onMouseMove={() => this.handleMove(it)}
            onMouseLeave = {() => this.handleLeave()}
            className={index + 1 <= now ? styles.select : styles.unSelect}
          >
            {it}
          </div>
        ))
      }
    </span>);
  }
}

export default index;
