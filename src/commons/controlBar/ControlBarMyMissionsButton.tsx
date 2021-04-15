import { Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import * as React from 'react';

import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import controlButton from '../ControlButton';
import {
  GitHubMissionBrowserDialog,
  GitHubMissionBrowserDialogProps
} from '../missionEditor/GitHubMissionBrowserDialog';
import { promisifyDialog } from '../utils/DialogHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';

type ControlBarMyMissionsButtonProps = {
  key: string;
};

export const ControlBarMyMissionsButton: React.FC<ControlBarMyMissionsButtonProps> = props => {
  return (
    <Tooltip2 content="Look at this photograph" placement={Position.TOP}>
      {controlButton('My Missions', IconNames.BADGE, handleOnClick)}
    </Tooltip2>
  );
};

async function handleOnClick() {
  const octokit = getGitHubOctokitInstance() as Octokit;

  if (octokit === undefined) {
    showWarningMessage('Please sign in with GitHub!', 2000);
    return;
  }

  const results = await octokit.repos.listForAuthenticatedUser();
  const userRepos = results.data;

  const onlyMissionRepos = userRepos.filter(repo => repo.name.startsWith('SA-'));

  await promisifyDialog<GitHubMissionBrowserDialogProps, void>(
    GitHubMissionBrowserDialog,
    resolve => ({
      missionRepos: onlyMissionRepos,
      onSubmit: resolve
    })
  );
}
