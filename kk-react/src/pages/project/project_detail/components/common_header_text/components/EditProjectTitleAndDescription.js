import React, { useEffect, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import MyIcon from '@components/MyIcon';
import { PROEJCT_PERMISSION } from '@shared/ProjectConfig';
import styles from '../index.less';

const { TextArea } = Input;

/**
 * type title/description
 */
function EditProjectTitleAndDescription(props) {
  const { defaultValue, handleSave, children, roleGroup, type } = props;
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(defaultValue);

  useEffect(() => {
    setTitle(defaultValue);
  }, [defaultValue]);

  return (
    <span className={styles.editProjectTitle}>
      {
        !edit &&
        <span>
          {children}
          {
            roleGroup === PROEJCT_PERMISSION.MANAGE &&
            <span className={styles.icon}>
              <MyIcon
                onClick={(e) => { setEdit(true) }}
                style={{ fontSize: '16px' }}
                type='icon-bianji'
                className="issueIcon"
              />
            </span>
          }
        </span>
      }

      {
        edit &&
        <span>
          {
            type === 'title' ?
              <Input
                value={title}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { setTitle(e.target.value) }}
                style={{ width: '45vw' }}
                maxLength={50}
              />
              :
              <TextArea
                value={title}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { setTitle(e.target.value) }}
                style={{ width: '40vw' }}
                maxLength={100}
                rows={4}
              />
          }

          <span className="f-ib" style={{ lineHeight: type === 'title' ? '' : '22px' }}>
            <span
              className={`${styles.checkButton} u-mgl10`}
              onClick={(e) => { e.stopPropagation(); setEdit(false); handleSave(title) }}>
              <CheckOutlined />
            </span>
            <span
              className={`${styles.checkButton} u-mgl10`}
              onClick={(e) => { e.stopPropagation(); setEdit(false); setTitle(defaultValue) }}>
              <CloseOutlined />
            </span>
          </span>
        </span>
      }

    </span>
  );
}

export default EditProjectTitleAndDescription;
