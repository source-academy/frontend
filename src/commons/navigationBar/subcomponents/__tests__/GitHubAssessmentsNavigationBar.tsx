import { Octokit } from '@octokit/rest';
import { shallow } from 'enzyme';

import GitHubAssessmentsNavigationBar from '../GitHubAssessmentsNavigationBar';

const props = {
  changeCourseHandler: () => {},
  handleGitHubLogIn: () => {},
  handleGitHubLogOut: () => {},
  octokit: new Octokit(undefined),
  courses: [],
  selectedCourse: '',
  setSelectedCourse: () => {},
  types: ['Missions', 'Quests']
};

test('Navbar renders correctly', () => {
  const navbar = <GitHubAssessmentsNavigationBar {...props} />;
  const tree = shallow(navbar);
  expect(tree.debug()).toMatchSnapshot();
});
