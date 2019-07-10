import * as React from 'react';

import { shallow } from 'enzyme';

import Profile from '../Profile';

import { Role } from '../../../reducers/states';

test('Profile renders "no XP, no Grade and Staff role" correctly', () => {
  const props = {
    grade: 0,
    maxGrade: 99,
    maxXp: 99,
    name: 'yeet',
    role: Role.Staff,
    xp: 0,
    isOpen: true,
    onClose: () => {}
  };
  const tree = shallow(<Profile {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('Profile renders "no XP, no Grade and Student role" correctly', () => {
  const props = {
    grade: 0,
    maxGrade: 99,
    maxXp: 99,
    name: 'yeeet',
    role: Role.Student,
    xp: 0,
    isOpen: true,
    onClose: () => {}
  };
  const tree = shallow(<Profile {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('Profile renders with XP, Grade and Student role" correctly', () => {
  const props = {
    grade: 33,
    maxGrade: 99,
    maxXp: 99,
    name: 'yeeeet',
    role: Role.Student,
    xp: 66,
    isOpen: true,
    onClose: () => {}
  };
  const tree = shallow(<Profile {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('Profile renders with XP, Grade and Staff role" correctly', () => {
  const props = {
    grade: 33,
    maxGrade: 99,
    maxXp: 99,
    name: 'yeeeeet',
    role: Role.Staff,
    xp: 66,
    isOpen: true,
    onClose: () => {}
  };
  const tree = shallow(<Profile {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
