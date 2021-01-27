import { mount } from 'enzyme';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import mountTest from '@tests/shared/mountTest';
import { PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import { ManPower } from '../ManPower';

const FormItem = Form.Item;

describe('ManPower', () => {
  const connectProps = {
    manPowerValue: {},
    getLoading: false,
    refreshLoading: false,
    dispatch: jest.fn()
  };
  mountTest(ManPower, null, { ...connectProps });

  const setup = (props) => {
    const mountWrapper = mount(<ManPower {...props} {...connectProps} />);
    return {
      mountWrapper
    }
  }

  it('when datasource is jira', () => {
    const { mountWrapper } = setup({
      dataSource: PROJECT_DATASOURCE.JIRA,
      type: 'advise'
    });
    expect(mountWrapper.find(FormItem).exists()).toBe(false);
  })

  describe('when datasource is ep', () => {
    it('type is project', () => {
      const { mountWrapper } = setup({
        dataSource: PROJECT_DATASOURCE.EP,
        type: 'project'
      });
      expect(mountWrapper.find(FormItem).exists()).toBe(false)
    })

    it('type is not project', () => {
      const { mountWrapper } = setup({
        dataSource: PROJECT_DATASOURCE.EP,
        type: 'advise'
      });
      expect(mountWrapper.find(FormItem).exists()).toBe(true)
    })
  })

})
