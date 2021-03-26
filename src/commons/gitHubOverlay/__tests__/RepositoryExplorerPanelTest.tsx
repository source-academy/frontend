import { mount } from 'enzyme';

import { RepositoryExplorerPanel } from '../RepositoryExplorerPanel';

const REPO_1 = { name: 'repoName1', id: 1 };
const REPO_2 = { name: 'repoName2', id: 2 };
const REPO_3 = { name: 'repoName3', id: 3 };

const USER_REPOS: { name: string; id: number }[] = [REPO_1, REPO_2, REPO_3];
const EMPTY_USER_REPOS: { name: string; id: number }[] = [];

test('Test repository list renders correctly', () => {
  const props = {
    userRepos: USER_REPOS,
    repoName: '',
    setRepoName: () => {},
    refreshRepoFiles: () => {}
  };
  const REP = mount(<RepositoryExplorerPanel {...props} />);
  expect(REP.debug()).toMatchSnapshot();
});

test('Test empty repository list renders correctly', () => {
  const props = {
    userRepos: EMPTY_USER_REPOS,
    repoName: '',
    setRepoName: () => {},
    refreshRepoFiles: () => {}
  };
  const REP = mount(<RepositoryExplorerPanel {...props} />);
  expect(REP.debug()).toMatchSnapshot();
});
