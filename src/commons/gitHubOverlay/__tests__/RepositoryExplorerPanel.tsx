import { act, fireEvent, render, screen } from "@testing-library/react";
import { mount } from "enzyme";

import { RepositoryExplorerPanel } from '../RepositoryExplorerPanel';

test('Test refreshRepoFiles called on mount', () => {
  act(() => {
    render(<RepositoryExplorerPanel {...props} />);
  });

  expect(props.refreshRepoFiles).toHaveBeenCalledTimes(1);
});

test("Test Radio clicked calls setRepoName", () => {
  act(() => {
    render(<RepositoryExplorerPanel {...props} />);
  });

  const leftClick = { button: 1 };
  fireEvent.click(screen.getByText('repoName1'), leftClick);
  expect(props.setRepoName).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('repoName2'), leftClick);
  expect(props.setRepoName).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByText('repoName3'), leftClick);
  expect(props.setRepoName).toHaveBeenCalledTimes(3);
});

test('Test repository list renders correctly', () => {
  const REP = mount(<RepositoryExplorerPanel {...props} />);
  expect(REP.debug()).toMatchSnapshot();
});

// example props
const repo1 = { name: 'repoName1', id: 1 };
const repo2 = { name: 'repoName2', id: 2 };
const repo3 = { name: 'repoName3', id: 3 };
const userRepos: { name: string; id: number }[] = [repo1, repo2, repo3];
const props = {
  userRepos: userRepos,
  repoName: '',
  setRepoName: jest.fn(),
  refreshRepoFiles: jest.fn()
};
