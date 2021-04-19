import { Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import * as React from 'react';

import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import MissionData from '../../features/missionEditor/MissionData';
import TaskData from '../../features/missionEditor/TaskData';
import controlButton from '../ControlButton';
import {
  GitHubMissionBrowserDialog,
  GitHubMissionBrowserDialogProps
} from '../missionEditor/GitHubMissionBrowserDialog';
import { promisifyDialog } from '../utils/DialogHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';

type ControlBarMyMissionsButtonProps = {
  key: string;
  setBriefingContent: (newBriefingContent: string) => void;
};

export const ControlBarMyMissionsButton: React.FC<ControlBarMyMissionsButtonProps> = props => {
  const handleOnClick = handleOnClickGenerator(props.setBriefingContent);

  return (
    <Tooltip2 content="Look at this photograph" placement={Position.TOP}>
      {controlButton('My Missions', IconNames.BADGE, handleOnClick)}
    </Tooltip2>
  );
};

function handleOnClickGenerator(setBriefingContent: (newBriefingContent: string) => void) {
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

    const authUser = await octokit.users.getAuthenticated();
    const loginId = authUser.data.login;

    const missionData = await getMissionData(loginId, chosenRepoName, octokit);
    console.log(missionData);

    setBriefingContent(missionData.missionBriefing);
  };
}

async function getMissionData(loginId: string, repoName: string, octokit: Octokit) {
  const briefingString = await getMissionBriefing(loginId, repoName, octokit);
  const metadataString = await getMissionMetadata(loginId, repoName, octokit);
  const tasksData = await getTasksData(loginId, repoName, octokit);

  return new MissionData(briefingString, metadataString, tasksData);
}

async function getMissionBriefing(loginId: string, repoName: string, octokit: Octokit) {
  const briefing = await octokit.repos.getContent({
    owner: loginId,
    repo: repoName,
    path: '/README.md'
  });

  const briefingString = Buffer.from((briefing.data as any).content, 'base64').toString();
  return briefingString;
}

async function getMissionMetadata(loginId: string, repoName: string, octokit: Octokit) {
  const metadata = await octokit.repos.getContent({
    owner: loginId,
    repo: repoName,
    path: '/METADATA'
  });

  const metadataString = Buffer.from((metadata.data as any).content, 'base64').toString();
  return metadataString;
}

async function getTasksData(loginId: string, repoName: string, octokit: Octokit) {
  const questions: TaskData[] = [];

  for (let i = 1; i <= 20; i++) {
    const questionFolderName = '/Q' + i;

    // Check if the question exists
    try {
      await octokit.repos.getContent({
        owner: loginId,
        repo: repoName,
        path: questionFolderName
      });
    } catch (err) {
      break;
    }

    // If the question exists, get the data
    try {
      const taskDescription = await octokit.repos.getContent({
        owner: loginId,
        repo: repoName,
        path: questionFolderName + '/Problem.md'
      });

      const starterCode = await octokit.repos.getContent({
        owner: loginId,
        repo: repoName,
        path: questionFolderName + '/StarterCode.js'
      });

      const taskDescriptionString = Buffer.from(
        (taskDescription.data as any).content,
        'base64'
      ).toString();
      const starterCodeString = Buffer.from((starterCode.data as any).content, 'base64').toString();

      const taskData = new TaskData(taskDescriptionString, starterCodeString);

      questions.push(taskData);
    } catch (err) {
      console.error(err);
    }
  }

  return questions;
}
