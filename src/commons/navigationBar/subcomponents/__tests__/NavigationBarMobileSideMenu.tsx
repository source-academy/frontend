import { shallow } from 'enzyme';
import { useSelector } from 'react-redux';

import { Role } from '../../../application/ApplicationTypes';
import NavigationBarMobileSideMenu from '../NavigationBarMobileSideMenu';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}));
const useSelectorMock = useSelector as jest.Mock;

test('NavigationBarMobileSideMenu renders "Not logged in" correctly', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    assessmentTypes: undefined
  };
  useSelectorMock.mockReturnValueOnce({});
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBarMobileSideMenu renders correctly when logged in (no course selected)', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    assessmentTypes: undefined
  };
  useSelectorMock.mockReturnValueOnce({
    name: 'Avenger'
  });

  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBarMobileSideMenu renders correctly when logged in (with course selected)', () => {
  const props = {
    isOpen: true,
    onClose: () => {},
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others'],
    courseId: 1
  };
  useSelectorMock.mockReturnValueOnce({
    name: 'Avenger',
    role: Role.Student,
    courseId: 1,
    enableAchievements: true,
    enableSourcecast: true
  });
  const tree = shallow(<NavigationBarMobileSideMenu {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
