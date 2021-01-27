import React, { Component } from 'react';
import { isBusinessFun } from '@utils/helper';

// 属性代理
export default function BusinessHOC() {
  return (Com) => {
    class index extends Component {
      constructor(props) {
        super(props);
        this.state = {
          isBusiness: false, // true 商业化 false 网易
        };
      }

      componentDidMount() {
        const isBusiness = isBusinessFun();
        this.setState({ isBusiness });
      }

      render() {
        const { isBusiness } = this.state;

        return (
          <Com
            isBusiness={isBusiness}
            {...this.props}
          />);
      }
    }

    return index;
  };
}