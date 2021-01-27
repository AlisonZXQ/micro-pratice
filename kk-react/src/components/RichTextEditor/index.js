import React, { Component } from 'react';
import { connect } from 'dva';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import 'braft-extensions/dist/table.css';
import Table from 'braft-extensions/dist/table';
import { uploadImg } from '@services/weekReport';
import styles from './index.less';

const defaultControls = [
  'headings', 'list-ul', 'list-ol', 'separator',
  'text-indent', 'separator',
  'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
  'remove-styles', 'separator',
  'link', 'media', 'separator',
  'clear', 'fullscreen'
];

// 表格的options
const options = {
  defaultColumns: 3, // 默认列数
  defaultRows: 3, // 默认行数
  withDropdown: true, // 插入表格前是否弹出下拉菜单
  columnResizable: true, // 允许调整列宽
  exportAttrString: 'border="1" style="border-collapse: collapse"', // 指定输出HTML时附加到table标签上的属性字符串
  // includeEditors: ['editor-1'], // 指定该模块对哪些BraftEditor生效，不传此属性则对所有BraftEditor有效
  // excludeEditors: ['editor-id-2'] // 指定该模块对哪些BraftEditor无效
};

BraftEditor.use(Table(options));

const allowFontSizes = [12, 14, 16, 18, 20, 24, 28, 30, 32];

const mediaConfig = {
  accepts: {
    video: false,
    audio: false,
  },
  externals: {
    video: false,
    audio: false,
    embed: false,
  }
};

class RichTextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorStateValue: BraftEditor.createEditorState(props.value),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { editorStateValue } = this.state;

    //（应对value和initialValue不一致的问题）getFieldDecorator问题
    if (this.props.des !== nextProps.des && nextProps.des !== editorStateValue.toHTML()) {
      this.setState({
        editorStateValue: BraftEditor.createEditorState(nextProps.des),
      });
    }
  }

  onChange = (editorStateValue) => {
    const { onChange } = this.props;
    this.setState({ editorStateValue }, () => {
      if (onChange) {
        onChange(editorStateValue.toHTML());
      }
    });
  }

  preview = () => {
    if (window.previewWindow) {
      window.previewWindow.close();
    }

    window.previewWindow = window.open();
    window.previewWindow.document.write(this.buildPreviewHtml());
    window.previewWindow.document.close();

  }

  buildPreviewHtml = () => {
    return `
      <!Doctype html>
      <html>
        <head>
          <title>Preview Content</title>
          <style>
            html,body{
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: auto;
              background-color: #f1f2f3;
            }
            .container{
              box-sizing: border-box;
              width: 1000px;
              max-width: 100%;
              min-height: 100%;
              margin: 0 auto;
              padding: 30px 20px;
              overflow: hidden;
              background-color: #fff;
              border-right: solid 1px #eee;
              border-left: solid 1px #eee;
            }
            .container img,
            .container audio,
            .container video{
              max-width: 100%;
              height: auto;
            }
            .container p{
              white-space: pre-wrap;
              min-height: 1em;
            }
            .container pre{
              padding: 15px;
              background-color: #f1f1f1;
              border-radius: 5px;
            }
            .container blockquote{
              margin: 0;
              padding: 15px;
              background-color: #f1f1f1;
              border-left: 3px solid #d1d1d1;
            }
          </style>
        </head>
        <body>
          <div class="container">${this.state.editorStateValue.toHTML()}</div>
        </body>
      </html>
    `;
  }

  uploadFn = ({ file, id, success, error }) => {
    const formData = new FormData();
    formData.append('file', file);

    uploadImg(formData).then((res) => {
      if (res.code === 200) {
        const url = res.result.url;
        success({ url: url });
      } else {
        error.error(res.message);
      }
    }).catch(() => error());
  }

  render() {
    const { readOnly, height, placeholder, extend, controls: propsControls } = this.props;
    const { editorStateValue } = this.state;
    const controls = propsControls ? propsControls : defaultControls;

    const extendControls = [
      {
        key: 'custom-button',
        type: 'button',
        text: '预览',
        onClick: this.preview
      }
    ];
    return (
      <div className="my-component">
        <BraftEditor
          id="editor-1"
          placeholder={placeholder}
          onChange={this.onChange}
          value={editorStateValue}
          fontSizes={allowFontSizes}
          controls={readOnly ? [] : controls}
          extendControls={extend ? extendControls : []}
          readOnly={readOnly}
          imageResizable
          media={{
            ...mediaConfig,
            uploadFn: this.uploadFn,
          }}
          className={readOnly ? styles.readonlyStyle : styles.style}
          contentStyle={{ height }}
        />
      </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    des: state.design.des,
  };
};

export default connect(mapStateToProps)(RichTextEditor);
