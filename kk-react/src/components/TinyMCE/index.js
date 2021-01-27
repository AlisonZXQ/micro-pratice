import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message } from 'antd';
import { connect } from 'dva';
import { Editor } from '@tinymce/tinymce-react';
import { uploadImg } from '@services/weekReport';
import { queryUser } from '@services/project';
import '../../../public/tinymce/js/tinymce/tinymce.min.js';
import '../../../public/tinymce/js/tinymce/plugins/mention/plugin.min.js';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorStateValue: props.value,
    };
    this.ref = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.editorStateValue) {
      this.setState({
        editorStateValue: nextProps.value,
      });
    }
  }

  handleEditorChange = (editorStateValue, editor) => {
    const { onChange, fullModalChange } = this.props;
    this.setState({ editorStateValue }, () => {
      if (onChange) {
        onChange(editorStateValue);
        this.props.dispatch({ type: 'design/saveDes', payload: editorStateValue });
      }
      if (fullModalChange) {
        fullModalChange(editorStateValue);
      }
    });
  }

  render() {
    const { height, autoFocus } = this.props;
    const { editorStateValue } = this.state;
    return (
      <Editor
        value={editorStateValue}
        init={{
          language: 'zh_CN',
          height: height ? height : 500,
          menubar: false,
          statusbar: false,
          branding: false,
          forced_root_block: '',
          auto_focus: !!autoFocus,
          convert_urls: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount mention hr codesample'
          ],
          toolbar:
            'undo redo | formatselect strikethrough | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | table image link hr codesample | preview',
          images_upload_handler: (blob, success, fail) => {
            const formData = new FormData();
            formData.append('file', blob.blob());

            uploadImg(formData).then((res) => {
              if (res.code === 200) {
                const url = res.result.url;
                success(url);
              } else {
                fail();
              }
            }).catch(err => {
              alert('request failed', err);
            });
          },
          paste_data_images: true, // 设置为“true”将允许粘贴图像，而将其设置为“false”将不允许粘贴图像。
          mentions: {
            delimiter: '@',
            source: function (query, process, delimiter) {
              if (delimiter === '@') {
                if (query && query.trim()) {
                  const params = {
                    value: query,
                    limit: 20,
                    offset: 0,
                  };
                  const promise = queryUser(params);
                  promise.then(res => {
                    if (res.code !== 200) return message.error(res.msg);
                    let arr = [];
                    res.result.forEach(it => {
                      arr.push({
                        name: `${it.realname} ${it.email}`
                      });
                    });
                    process(arr.length ? arr : []);
                  }).catch(err => {
                    return message.error(err || err.message);
                  });
                } else {
                  process([]);
                }
              }
            },
            render: function (item) {
              return '<li class="">' +
                '<a href="javascript:;"><span>' + item.name + '</span></a>' +
                '</li>';
            },
            insert: function (item) {
              const name = item.name || '';
              const arr = name.split(' ') || [];
              const email = arr[1] || '';
              return `<a href=http://popo.netease.com/static/html/open_popo.html?ssid=${email}&sstp=0 target=_blank>@` + item.name + '</a>&nbsp;';
            },
            renderDropdown: function () {
              return '<ul class="rte-autocomplete dropdown-menu"></ul>';
            }
          },
        }}
        onEditorChange={this.handleEditorChange}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    des: state.design.des,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
