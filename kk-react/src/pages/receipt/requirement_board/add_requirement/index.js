import React, { useEffect, useState } from 'react';
import { Button, Modal, message } from 'antd';
import { addKanbanIssue } from '@services/requirement_board';
import RequireForm from '../components/require_form';

function Index(props) {
  const { kanbanIssue, handleChangeKanban } = props;
  const [visible, setVisible] = useState(false);
  const [checkList, setCheckList] = useState([]);

  const updateCheckList = (list) => {
    setCheckList([...list]);
  };

  const handleOk = () => {
    const params = {
      requirementKanbanId: props.currentKanban && props.currentKanban.id,
      requirementIdList: checkList,
    };
    addKanbanIssue(params).then(res => {
      if(res.code !== 200) return message.error(res.msg);
      setVisible(false);
      handleChangeKanban(props.currentKanban);
      return message.success('添加成功');
    }).catch(err => {
      return message.error(err.message);
    });
  };
  const setInitCheckList = () => {
    setVisible(true);

    let arr = [];
    kanbanIssue.map(it => {
      arr.push(it.requirementId);
    });
    setCheckList(arr);
  };

  return <span>
    <Modal
      title='添加需求'
      visible={visible}
      width={1000}
      onCancel={() => setVisible(false)}
      destroyOnClose
      footer={<span>
        <Button onClick={() => { setVisible(false); setCheckList([]) }}>取消</Button>
        <Button type='primary' onClick={() => handleOk()}>
          确认({checkList.length})
        </Button>
      </span>}
    >
      <RequireForm
        productid={props.productid}
        updateCheckList={updateCheckList}
        issueIdList={kanbanIssue.map(it => it.requirementId)}
        type='add'
      />
    </Modal>
    <Button onClick={() => setInitCheckList()}>添加需求</Button>

  </span>;
}

export default Index;
