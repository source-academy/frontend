import { shallow } from 'enzyme';
import * as React from 'react';

import Login from '../Login';

test('Login renders correctly', () => {
  const props = {
    handleLogin: () => {},
    handleFetchAuth: (luminusCode: string) => {}
  };
  const app = <Login {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Loading login renders correctly', () => {
  const props = {
    handleLogin: () => {},
    handleFetchAuth: (luminusCode: string) => {},
    luminusCode: '1VL3 T0K3N'
  };
  const app = <Login {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
