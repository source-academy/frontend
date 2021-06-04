import { shallow } from 'enzyme';

import Login from '../Login';

test('Login renders correctly', () => {
  const props = {
    handleLogin: () => {},
    handleFetchAuth: (code: string, providerId?: string) => {},
    providers: [
      {
        id: 'nusnet_id',
        name: 'LumiNUS'
      }
    ]
  };
  const app = <Login {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Loading login renders correctly', () => {
  const props = {
    handleLogin: () => {},
    handleFetchAuth: (code: string, providerId?: string) => {},
    code: 'Luminus Code',
    providers: []
  };
  const app = <Login {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
