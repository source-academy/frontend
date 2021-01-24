import { shallow } from 'enzyme';
import * as React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';

import NavigationBar from '../NavigationBar';
import NavigationBarMobileSideMenu from '../NavigationBarMobileSideMenu';

test('NavigationBar renders "Not logged in" correctly', () => {
  const props = {
    handleLogOut: () => {},
    title: 'Source Academy'
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBar renders correctly with student role', () => {
  const props = {
    handleLogOut: () => {},
    title: 'Source Academy',
    role: Role.Student
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBarMobileSideMenu renders "Not logged in" correctly', () => {
  const props = {
    isOpen: true,
    onClose: () => {}
  };
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBarMobileSideMenu renders correctly with student role', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    role: Role.Student
  };
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
