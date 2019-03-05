import { shallow } from 'enzyme';
import * as React from 'react';

import { Role } from '../../../reducers/states';
import NavigationBar from '../NavigationBar';

test('Grading NavLink does NOT renders for Role.Student', () => {
  const props = { role: Role.Student };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: 'academy/grading' }).exists())
  ).toHaveLength(0);
});

test('Grading NavLink renders for Role.Staff', () => {
  const props = { role: Role.Staff };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/grading' }).exists())
  ).toHaveLength(1);
});

test('Grading NavLink renders for Role.Admin', () => {
  const props = { role: Role.Admin };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/grading' }).exists())
  ).toHaveLength(1);
});
