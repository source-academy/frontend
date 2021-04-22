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
import { getMissionData } from '../missionEditor/GitHubMissionDataUtils';
import MissionData from '../missionEditor/MissionData';
import MissionRepoData from '../missionEditor/MissionRepoData';
import { promisifyDialog, showSimpleConfirmDialog } from '../utils/DialogHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';

type ControlBarMyMissionsButtonProps = {
  key: string;
  loadMission: (missionData: MissionData) => void;
};

export const ControlBarMyMissionsButton: React.FC<ControlBarMyMissionsButtonProps> = props => {
  const handleOnClick = createOnClickHandler(props);

  return (
    <Tooltip2 content="Look at this photograph" placement={Position.TOP}>
      {controlButton('My Missions', IconNames.BADGE, handleOnClick)}
    </Tooltip2>
  );
};

function createOnClickHandler(props: ControlBarMyMissionsButtonProps) {
  return async () => {
    const octokit = getGitHubOctokitInstance() as Octokit;

    if (octokit === undefined) {
      showWarningMessage('Please sign in with GitHub!', 2000);
      return;
    }

    const allMissionRepos = await getMissionRepoData(octokit.repos.listForAuthenticatedUser);

    const chosenRepo = await promisifyDialog<GitHubMissionBrowserDialogProps, MissionRepoData>(
      GitHubMissionBrowserDialog,
      resolve => ({
        missionRepos: allMissionRepos,
        resolveDialog: missionRepo => resolve(missionRepo)
      })
    );

    if (chosenRepo.repoName === '') {
      return;
    }

    const confirmOpen: boolean = await showSimpleConfirmDialog({
      title: 'Opening New Mission',
      contents: (
        <div>
          <p>Opening a new mission will overwrite the current contents of your workspace.</p>
          <p>Please make sure that you have saved all changes before proceeding!</p>
        </div>
      ),
      positiveLabel: 'Proceed',
      negativeLabel: 'Cancel'
    });

    if (confirmOpen) {
      const missionData = await getMissionData(chosenRepo, octokit);
      props.loadMission(missionData);
    }
  };
}

async function getMissionRepoData(getRepos: any) {
  const repos = (await getRepos({ per_page: 100 })).data;
  return repos
    .filter((repo: any) => repo.name.startsWith('SA-'))
    .map((repo: any) => new MissionRepoData(repo.owner.login, repo.name)) as MissionRepoData[];
}
