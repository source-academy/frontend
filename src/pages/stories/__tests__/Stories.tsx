import { shallow } from 'enzyme';

import Stories from '../Stories';

test('Stories renders correctly', () => {
  const app = <Stories />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
