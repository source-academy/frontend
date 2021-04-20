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
import { promisifyDialog } from '../utils/DialogHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';

type ControlBarMyMissionsButtonProps = {
  key: string;
  setBriefingContent: (newBriefingContent: string) => void;
  setSourceChapter: (newSourceChapter: number) => void;
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

    const results = await octokit.repos.listForAuthenticatedUser();
    const userRepos = results.data;
    const onlyMissionRepos = userRepos.filter(repo => repo.name.startsWith('SA-'));

    const chosenRepoName = await promisifyDialog<GitHubMissionBrowserDialogProps, string>(
      GitHubMissionBrowserDialog,
      resolve => ({
        missionRepos: onlyMissionRepos,
        onSubmit: repoName => resolve(repoName)
      })
    );

    if (chosenRepoName === '') {
      return;
    }

    const missionData = await getMissionData(chosenRepoName, octokit);
    console.log(missionData);

    props.setBriefingContent(missionData.missionBriefing);
    props.setSourceChapter(missionData.missionMetadata.sourceVersion);
  };
}
