import { shallow } from 'enzyme';

import { Role } from '../../../application/ApplicationTypes';
import AcademyNavigationBar from '../AcademyNavigationBar';

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard, Grading and AdminPanel NavLinks do NOT render for Role.Student', () => {
  const props = {
    role: Role.Student,
    notifications: [],
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const tree = shallow(<AcademyNavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/grading' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/groundcontrol' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/sourcereel' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/storysimulator' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/dashboard' }).exists())
  ).toHaveLength(0);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/adminpanel' }).exists())
  ).toHaveLength(0);
});

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard and Grading NavLinks render for Role.Staff', () => {
  const props = {
    role: Role.Staff,
    notifications: [],
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const tree = shallow(<AcademyNavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/grading' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/groundcontrol' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/sourcereel' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/storysimulator' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/dashboard' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/adminpanel' }).exists())
  ).toHaveLength(0);
});

test('MissionControl, GroundControl, Sourcereel, StorySimulator, Dashboard, Grading and AdminPanel NavLinks render for Role.Admin', () => {
  const props = {
    role: Role.Admin,
    notifications: [],
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const tree = shallow(<AcademyNavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/grading' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/groundcontrol' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/sourcereel' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/storysimulator' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/dashboard' }).exists())
  ).toHaveLength(1);
  expect(
    tree.filterWhere(shallowTree => shallowTree.find({ to: '/academy/adminpanel' }).exists())
  ).toHaveLength(1);
});
