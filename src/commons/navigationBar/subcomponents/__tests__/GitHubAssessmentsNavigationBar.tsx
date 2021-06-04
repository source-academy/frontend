import { shallow } from 'enzyme';

import GitHubAssessmentsNavigationBar from '../GitHubAssessmentsNavigationBar';

const props = {
  handleGitHubLogIn: () => {},
  handleGitHubLogOut: () => {}
};

test('Navbar renders correctly', () => {
  const navbar = <GitHubAssessmentsNavigationBar {...props} />;
  const tree = shallow(navbar);
  expect(tree.debug()).toMatchSnapshot();
});
