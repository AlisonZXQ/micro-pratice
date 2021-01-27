import OrderTime from '@components/OrderTime';
import mountTest from '@tests/shared/mountTest';

describe('OrderTime', () => {
  mountTest(OrderTime, null, { orderFieldData: [] });
})
