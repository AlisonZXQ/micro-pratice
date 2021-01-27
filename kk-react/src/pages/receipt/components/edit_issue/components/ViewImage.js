import React from 'react';
import ReactDOM from 'react-dom';
import Viewer from 'react-viewer';

function ViewImage({ handleClose, imageSrc, richValue }) {

  const getAllImageHref = (content) => {
    let hrefArrExceptCurrent = [];
    // 匹配img元素
    const _img = /<img\b.*?(?:\>|\/>)/gi;
    content.replace(_img, (str) => {
      // 获取img的href元素
      const _href = /\bsrc\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/i;
      const newStr = _href.exec(str);
      const href = newStr[1];
      if (!href.includes(imageSrc)) {
        hrefArrExceptCurrent.push({
          src: href,
          alt: href,
        });
      }
    });
    return hrefArrExceptCurrent;
  };

  return ReactDOM.createPortal(
    <div>
      <Viewer
        visible={true}
        onClose={() => { handleClose() }}
        images={[{ src: imageSrc, alt: imageSrc }, ...getAllImageHref(richValue)]}
      />
    </div>,
    document.body,
  );
}

export default ViewImage;
