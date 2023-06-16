import { shallow } from 'enzyme';
import { useSelector } from 'react-redux';

import { Role } from '../../../application/ApplicationTypes';
import AcademyNavigationBar from '../AcademyNavigationBar';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}));
const useSelectorMock = useSelector as jest.Mock;

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard, Grading and AdminPanel NavLinks do NOT render for Role.Student', () => {
  const props = {
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  useSelectorMock.mockReturnValueOnce({
    role: Role.Student,
    courseId: 0
  });

  const tree = shallow(<AcademyNavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/grading' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/groundcontrol' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/sourcereel' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/storysimulator' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/dashboard' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/adminpanel' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/xpcalculation' }).exists())
  ).toHaveLength(0);
});

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard and Grading NavLinks render for Role.Staff', () => {
  const props = {
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  useSelectorMock.mockReturnValueOnce({
    role: Role.Staff,
    courseId: 0
  });

  const tree = shallow(<AcademyNavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/grading' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/groundcontrol' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/sourcereel' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/storysimulator' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/dashboard' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/xpcalculation' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/adminpanel' }).exists())
  ).toHaveLength(0);
});

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard, Grading, XP Calculation and AdminPanel NavLinks render for Role.Admin', () => {
  const props = {
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  useSelectorMock.mockReturnValueOnce({
    role: Role.Admin,
    courseId: 0
  });

  const tree = shallow(<AcademyNavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/grading' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/groundcontrol' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/sourcereel' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/storysimulator' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/dashboard' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/xpcalculation' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/courses/0/adminpanel' }).exists())
  ).toHaveLength(1);
});
