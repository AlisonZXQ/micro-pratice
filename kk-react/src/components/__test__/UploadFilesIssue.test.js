import { shallow, mount } from 'enzyme';
import monutTest from '@tests/shared/mountTest';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Upload, Empty } from 'antd';
import configureStore from 'redux-mock-store';
import { Index as UploadFilesIssue } from '../UploadFilesIssue';

const { Dragger } = Upload;

describe('UploadFilesIssue', () => {
  const UploadCom = Form.create()(UploadFilesIssue);

  const setup = (props) => {
    const mountWrapper = mount(<UploadCom
      {...props}
    />);
    return {
      mountWrapper
    }
  }

  it('issueRole is manage and edit or rolegroup is manage then should be upload files', () => {
    const { mountWrapper: mountWrapper1 } = setup({ issueRole: 1, roleGroup: 3 });
    const { mountWrapper: mountWrapper2 } = setup({ issueRole: 3, roleGroup: 1 });
    const { mountWrapper: mountWrapper3 } = setup({ issueRole: 3, roleGroup: 3 });
    expect(mountWrapper1.find(Dragger).exists()).toBe(true);
    expect(mountWrapper2.find(Dragger).exists()).toBe(true);
    expect(mountWrapper3.find(Dragger).exists()).toBe(false);
  })

  it('fileList is Empty there should be Empty', () => {
    const { mountWrapper } = setup({ issueRole: 1, roleGroup: 3 });
    expect(mountWrapper.find(Empty).exists()).toBe(true);
  })

  it('fileList is not Empty there should be list or not list change Icon', () => {
    const { mountWrapper } = setup({ issueRole: 1, roleGroup: 3, defaultValue: [{ name: '', type: '', id: 0, url: '' }] });
    expect(mountWrapper.find(Empty).exists()).toBe(false);
    expect(mountWrapper.find('[type="icon-tupianzhanshi"]').exists()).toBe(true);
    expect(mountWrapper.find('[type="icon-liebiaozhanshi"]').exists()).toBe(false);
    mountWrapper.find('.f-tar').childAt(0).simulate('click')
    expect(mountWrapper.find('[type="icon-liebiaozhanshi"]').exists()).toBe(true);
    expect(mountWrapper.find('[type="icon-tupianzhanshi"]').exists()).toBe(false);
  })
})
