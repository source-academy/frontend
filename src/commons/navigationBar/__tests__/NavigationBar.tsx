import { shallow } from 'enzyme';
import * as React from 'react';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

test('NavigationBar renders "Not logged in" correctly', () => {
  const props = {
    handleLogOut: () => {},
    handeGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    title: 'Source Academy'
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBar renders correctly with student role', () => {
  const props = {
    handleLogOut: () => {},
    handeGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    title: 'Source Academy',
    role: Role.Student
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
