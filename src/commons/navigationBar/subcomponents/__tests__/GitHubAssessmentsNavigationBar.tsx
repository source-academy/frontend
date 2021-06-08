import { Octokit } from '@octokit/rest';
import { shallow } from 'enzyme';

import GitHubAssessmentsNavigationBar from '../GitHubAssessmentsNavigationBar';

const props = {
  handleGitHubLogIn: () => {},
  handleGitHubLogOut: () => {},
  octokit: new Octokit(undefined),
  courses: [],
  selectedCourse: '',
  setSelectedCourse: () => {},
  typeNames: []
};

test('Navbar renders correctly', () => {
  const navbar = <GitHubAssessmentsNavigationBar {...props} />;
  const tree = shallow(navbar);
  expect(tree.debug()).toMatchSnapshot();
});
