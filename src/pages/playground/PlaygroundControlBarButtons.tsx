import { Octokit } from '@octokit/rest';
import * as React from 'react';
import { AnyAction } from 'redux';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';

import { loginGitHub, logoutGitHub } from '../../commons/application/actions/SessionActions';
import { ControlBarGitHubButtons } from '../../commons/controlBar/github/ControlBarGitHubButtons';
import {
  githubOpenFile,
  githubSaveFile,
  githubSaveFileAs
} from '../../features/github/GitHubActions';

export const makeGithubButtons = (
  isFolderModeEnabled: boolean,
  loggedInAs: Octokit | undefined,
  githubSaveInfo: GitHubSaveInfo,
  isDirty: boolean,
  dispatch: React.Dispatch<AnyAction>
) => (
  <ControlBarGitHubButtons
    key="github"
    isFolderModeEnabled={isFolderModeEnabled}
    loggedInAs={loggedInAs}
    githubSaveInfo={githubSaveInfo}
    isDirty={isDirty}
    onClickOpen={() => dispatch(githubOpenFile())}
    onClickSaveAs={() => dispatch(githubSaveFileAs())}
    onClickSave={() => dispatch(githubSaveFile())}
    onClickLogIn={() => dispatch(loginGitHub())}
    onClickLogOut={() => dispatch(logoutGitHub())}
  />
);
