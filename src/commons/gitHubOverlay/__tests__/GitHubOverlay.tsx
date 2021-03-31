import { act, fireEvent, render, screen } from '@testing-library/react';
import { mount } from 'enzyme';

import GitHubOverlay from '../GitHubOverlay';

test('Test clicking close closes picker', () => {
  act(() => {
    render(<GitHubOverlay {...props} />);
  });

  const leftClick = { button: 1 };
  fireEvent.click(screen.getByLabelText('Close'), leftClick);
  expect(props.handleGitHubCloseFileExplorerDialog).toHaveBeenCalledTimes(1);
});

test('Test GitHubOverlay renders correctly', () => {
  const REP = mount(<GitHubOverlay {...props} />);
  expect(REP.debug()).toMatchSnapshot();
});

const repo1 = { name: 'repoName1', id: 1 };
const repo2 = { name: 'repoName2', id: 2 };
const repo3 = { name: 'repoName3', id: 3 };
const userRepos: { name: string; id: number }[] = [repo1, repo2, repo3];
const props = {
  userRepos: userRepos,
  pickerType: 'Open',
  isPickerOpen: true,
  handleEditorValueChange: jest.fn(),
  handleGitHubCloseFileExplorerDialog: jest.fn(),
  handleGitHubBeginConfirmationDialog: jest.fn()
};
