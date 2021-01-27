//最佳实践：将ErrorBoundary抽象为一个公用的组件类
import React, { Component } from 'react';
import { SentryInit } from '@utils/sentry';
import Error from '@components/Error';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      info: '',
    };
  }

  componentDidMount() {
    SentryInit();

    window.addEventListener("unhandledrejection", (e) => {
      console.log(`未处理的promise异常: ` + e.reason);
    });

  }

  componentDidCatch(err, info) {
    this.setState({ hasError: true, info: err });
    console.log('err', err);
    console.log('info', info);
  }

  render() {
    const { hasError, info } = this.state;

    if (hasError) {
      return <div>
        <Error info={info} />
      </div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
