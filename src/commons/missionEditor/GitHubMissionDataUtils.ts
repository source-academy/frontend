import { Octokit } from '@octokit/rest';

import MissionData from './MissionData';
import MissionMetadata from './MissionMetadata';
import TaskData from './TaskData';

const maximumTasksPerMission = 20;

export async function getMissionData(repoName: string, octokit: Octokit) {
  const authUser = await octokit.users.getAuthenticated();
  const loginId = authUser.data.login;

  const briefingString = await getContentAsString(loginId, repoName, '/README.md', octokit);

  const metadataString = await getContentAsString(loginId, repoName, '/METADATA', octokit);
  const missionMetadata = convertMetadataStringToMissionMetadata(metadataString);
  missionMetadata.repoName = repoName;

  const tasksData = await getTasksData(loginId, repoName, octokit);

  return new MissionData(briefingString, missionMetadata, tasksData);
}

async function getTasksData(loginId: string, repoName: string, octokit: Octokit) {
  const questions: TaskData[] = [];

  for (let i = 1; i <= maximumTasksPerMission; i++) {
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
      const taskDescription = await getContentAsString(
        loginId,
        repoName,
        questionFolderName + '/Problem.md',
        octokit
      );
      const starterCode = await getContentAsString(
        loginId,
        repoName,
        questionFolderName + '/StarterCode.js',
        octokit
      );

      const taskData = new TaskData(taskDescription, starterCode);

      questions.push(taskData);
    } catch (err) {
      console.error(err);
    }
  }

  return questions;
}

export async function getContentAsString(
  loginId: string,
  repoName: string,
  filepath: string,
  octokit: Octokit
) {
  const fileInfo = await octokit.repos.getContent({
    owner: loginId,
    repo: repoName,
    path: filepath
  });

  return Buffer.from((fileInfo.data as any).content, 'base64').toString();
}

function convertMetadataStringToMissionMetadata(metadataString: string) {
  const missionMetadata = new MissionMetadata();
  const stringPropsToExtract = ['coverImage', 'kind', 'number', 'title', 'reading', 'webSummary'];
  const numPropsToExtract = ['sourceVersion'];

  const retVal = parseMetadataProperties<MissionMetadata>(
    missionMetadata,
    stringPropsToExtract,
    numPropsToExtract,
    metadataString
  );

  return retVal;
}

export function parseMetadataProperties<R>(
  propertyContainer: R,
  stringProps: string[],
  numProps: string[],
  metadataString: string
) {
  const lines = metadataString.replace(/\r/g, '').split(/\n/);

  lines.forEach(line => {
    for (let i = 0; i < stringProps.length; i++) {
      const propName = stringProps[i];

      if (line.startsWith(propName)) {
        propertyContainer[propName] = line.substr(propName.length + 1);
        return;
      }
    }

    for (let i = 0; i < numProps.length; i++) {
      const propName = numProps[i];
      if (line.startsWith(propName)) {
        propertyContainer[propName] = parseInt(line.substr(propName.length + 1), 10);
        return;
      }
    }
  });

  return propertyContainer;
}
