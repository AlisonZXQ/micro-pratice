import React from 'react';
import { withRouter } from 'react-router-dom';
import BackToPreview from '@components/BackToPreview';

const urlListMap = {
  'advise': '/manage/productadvise/',
  'requirement': '/manage/productrequirement/',
  'task': '/manage/producttask/',
  'bug': '/manage/productbug/',
  'objective': '/manage/productobjective/',
  'ticket': '/manage/productticket/',
};

const issueNameMap = {
  'advise': '建议',
  'requirement': '需求',
  'task': '任务',
  'bug': '缺陷',
  'objective': '目标',
  'ticket': '工单',
};

function Back(props) {
  const { dispatch } = props;

  const getBack = () => {
    const { pathname } = props.location;
    const { from } = props.location.query;
    const { detail, type } = props;
    const product = detail.product || {};
    const subproduct = detail.subproduct || {};

    if (from) {
      if (from === 'my_workbench') {
        return <BackToPreview title="返回工作台" link={type === 'advise' ? `/my_workbench/advise` : '/my_workbench/issue'} />;
      } else if (from === 'requirement_pool') {
        return <BackToPreview title="返回需求管理" link={`/manage/requirement_pool/list?productid=${product.id}`} />;
      }
    } else if (pathname.includes('my_workbench')) {
      return <span
        onClick={() => dispatch && dispatch({ type: 'product/setLastProduct', payload: { productId: product.id } })}
      >
        <BackToPreview title={`${product.name}/${subproduct.name}`} link={`${urlListMap[type]}?productid=${product.id}`} />
      </span>;
    } else {
      return <span
        onClick={() => dispatch && dispatch({ type: 'product/setLastProduct', payload: { productId: product.id } })}
      ><BackToPreview
          title={`返回${issueNameMap[type]}列表`}
          link={`${urlListMap[type]}?productid=${product.id}`}
        />
      </span>;
    }
  };

  return (
    getBack()
  );
}

export default withRouter(Back);
