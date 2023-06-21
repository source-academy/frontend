import { Octokit } from '@octokit/rest';
import { shallowRender } from 'src/commons/utils/TestUtils';

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
  const tree = shallowRender(navbar);
  expect(tree).toMatchSnapshot();
});
