import { shallow } from 'enzyme';
import * as React from 'react';

import NavigationBar from '../NavigationBar';

test('NavigationBar renders "Not logged in" correctly', () => {
  const props = {
    handleLogOut: () => {},
    title: 'Source Academy'
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBar renders correctly with username', () => {
  const props = {
    handleLogOut: () => {},
    title: 'Source Academy',
    username: 'Evis Rucer'
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
