import React, { useState } from 'react';
import { CloseCircleFilled } from '@ant-design/icons';
import { Spin, Modal, message, Checkbox } from 'antd';
import { VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import { updateVersion, getPublishPre } from '@services/version';
import TextOverFlow from '@components/TextOverFlow';
import styles from './index.less';

function Index(props) {
  const { versionId, trigger } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [preLoading, setPreLoading] = useState(false);
  const [publishList, setPublishList] = useState([]);
  const [publishClosedCheckList, setPublishClosedCheckList] = useState([]);

  const handleOk = () => {
    const closedIssueKeys = getClosedIssueKeys(publishClosedCheckList);
    const backToRequirementPoolIds = getBackToRequirementPoolIds(publishClosedCheckList, publishList);
    const params = {
      id: versionId,
      state: VERISON_STATUS_MAP.PUBLISH,
      backToRequirementPoolIds: backToRequirementPoolIds,
      closedIssueKeys: closedIssueKeys
    };

    setLoading(true);
    updateVersion(params).then((res) => {
      setLoading(false);
      if (res.code !== 200) return message.error(res.msg);
      message.success('版本发布成功！');
      setVisible(false);
      if (props.okCallback) {
        props.okCallback();
      }
    }).catch((err) => {
      setLoading(false);
      return message.error(err || err.message);
    });
  };

  const getClosedIssueKeys = (selectedIssueKeys) => {
    return selectedIssueKeys.length ? selectedIssueKeys.map(it => it).join(',') : '';
  };

  const getBackToRequirementPoolIds = (publishClosedCheckList, publishList) => {
    let rtn = [];
    if (publishClosedCheckList.length) {
      rtn = publishList.length ? publishList.filter(it => !publishClosedCheckList.includes(it.issueKey)).map(it => it.versionPlan.id) : [];
    }
    else {
      rtn = publishList.length ? publishList.map(it => it.versionPlan.id) : [];
    }
    return rtn.join(',');
  };

  const handlePublishPre = () => {
    setVisible(true);

    const params = {
      id: versionId,
    };
    setPreLoading(true);
    getPublishPre(params).then((res) => {
      setPreLoading(false);
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        setPublishList(res.result.list || []);
      }
    }).catch((err) => {
      setPreLoading(false);
      return message.error(err || err.message);
    });
  };

  const handlePublishItemCheckboxChange = (currentIssueKey) => {
    let newCheckedList = [];
    if (publishClosedCheckList && publishClosedCheckList.includes(currentIssueKey)) {
      newCheckedList = publishClosedCheckList.filter(item => item !== currentIssueKey);
    }
    else {
      newCheckedList = [...publishClosedCheckList, currentIssueKey];
    }

    setPublishClosedCheckList(newCheckedList);
  };

  const handleSelectAllOrNot = (e) => {
    let newCheckedList = [];
    if (e.target.checked) {
      newCheckedList = publishList.map(it => it.issueKey);
    } else {
      newCheckedList = [];
    }
    setPublishClosedCheckList(newCheckedList);
  };

  const getPublishListDisplay = () => {
    return (<span>
      <span className="u-mgl20 f-ib u-mgb10" style={{ fontWeight: 500 }}>
        <Checkbox onChange={(e) => handleSelectAllOrNot(e)}>全选</Checkbox>
      </span>
      {
        publishList.map(it => {
          if (it.bug) {
            return (
              <div className="u-subtitle f-fs1" style={{ marginLeft: "20px" }}>
                <Checkbox
                  key={it.issueKey}
                  checked={publishClosedCheckList && publishClosedCheckList.includes(it.issueKey)}
                  onChange={(e) => handlePublishItemCheckboxChange(it.issueKey)}
                >
                  <TextOverFlow content={it.bug.name} maxWidth={300} />
                </Checkbox>
              </div>
            );
          }
          if (it.task) {
            return (
              <div className="u-subtitle f-fs1" style={{ marginLeft: "20px" }}>
                <Checkbox
                  key={it.issueKey}
                  checked={publishClosedCheckList && publishClosedCheckList.includes(it.issueKey)}
                  onChange={(e) => handlePublishItemCheckboxChange(it.issueKey)}
                >
                  <TextOverFlow content={it.task.name} maxWidth={300} />
                </Checkbox>
              </div>
            );
          }
          if (it.parentRequirement && it.requirement) {
            return (
              <div className="u-subtitle f-fs1" style={{ marginLeft: "20px" }}>
                <Checkbox
                  key={it.issueKey}
                  checked={publishClosedCheckList && publishClosedCheckList.includes(it.issueKey)}
                  onChange={(e) => handlePublishItemCheckboxChange(it.issueKey)}
                >
                  <TextOverFlow content={it.parentRequirement.name} maxWidth={300} />
                /
                  <TextOverFlow content={it.requirement.name} maxWidth={300} />
                </Checkbox>
              </div>
            );
          }
          if (!it.parentRequirement && it.requirement) {
            return (
              <div className="u-subtitle f-fs1" style={{ marginLeft: "20px" }}>
                <Checkbox
                  key={it.issueKey}
                  checked={publishClosedCheckList && publishClosedCheckList.includes(it.issueKey)}
                  onChange={(e) => handlePublishItemCheckboxChange(it.issueKey)}
                >
                  <TextOverFlow content={it.requirement.name} maxWidth={300} />
                </Checkbox>
              </div>
            );
          }
        }
        )}
    </span>);
  };

  return (
    <span>
      <span onClick={() => handlePublishPre()}>
        {trigger}
      </span>

      <Modal
        visible={visible}
        title={'发布版本'}
        onCancel={() => setVisible(false)}
        onOk={() => handleOk()}
        okButtonProps={{ loading }}
        destroyOnClose
        maskClosable={false}
      >
        <span>
          {publishList.length ?
            <div>
              <div className="u-mgb10">
                <CloseCircleFilled className={styles.icon} />
                  当前版本不能发布，有以下内容未完成：
              </div>

              <Spin spinning={preLoading}>
                {getPublishListDisplay()}
              </Spin>

              <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                勾选的内容将被关闭，其他未完成内容将移入需求池，并发布版本
              </div>
            </div> : '确认发布当前版本吗？'
          }
        </span>

      </Modal>
    </span>
  );
}

export default Index;
