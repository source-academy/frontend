import { Octokit } from '@octokit/rest';

import MissionData from './MissionData';
import MissionMetadata from './MissionMetadata';
import MissionRepoData from './MissionRepoData';
import TaskData from './TaskData';

export const maximumTasksPerMission = 20;

/**
 * Retrieves mission information - such as the briefings, questions, metadata etc. from a GitHub Repository.
 *
 * @param missionRepoData Repository information where the mission is stored
 * @param octokit The Octokit instance for the authenticated user
 */
export async function getMissionData(missionRepoData: MissionRepoData, octokit: any) {
  const briefingString = await getContentAsString(
    missionRepoData.repoOwner,
    missionRepoData.repoName,
    'README.md',
    octokit
  );

  const metadataString = await getContentAsString(
    missionRepoData.repoOwner,
    missionRepoData.repoName,
    '.metadata',
    octokit
  );

  const missionMetadata = convertMetadataStringToMissionMetadata(metadataString);

  const tasksData = await getTasksData(
    missionRepoData.repoOwner,
    missionRepoData.repoName,
    octokit
  );

  const newMissionData: MissionData = {
    missionRepoData: missionRepoData,
    missionBriefing: briefingString,
    missionMetadata: missionMetadata,
    tasksData: tasksData
  };

  return newMissionData;
}

/**
 * Retrieves information regarding each task in the Mission from the GitHub repository.
 *
 * @param repoOwner The owner of the mission repository
 * @param repoName The name of the mission repository
 * @param octokit The Octokit instance for the authenticated user
 */
export async function getTasksData(repoOwner: string, repoName: string, octokit: Octokit) {
  const questions: TaskData[] = [];

  const results = await octokit.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path: ''
  });

  const files = results.data;

  if (!Array.isArray(files)) {
    return questions;
  }

  for (let i = 1; i <= maximumTasksPerMission; i++) {
    const questionFolderName = 'Q' + i;

    // We make the assumption that there are no gaps in question numbering
    // If the question does not exist, we may break
    if (files.find(file => file.name === questionFolderName) === undefined) {
      break;
    }

    const folderContents = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: questionFolderName
    });

    if (!Array.isArray(folderContents.data)) {
      return questions;
    }

    const taskData = {
      taskDescription: '',
      starterCode: '',
      savedCode: '',
      testPrepend: '',
      testCases: []
    };

    const identity = (content: any) => content;

    const folderContentsAsArray = folderContents.data as any[];

    // Map from each property to an object storing the following information:
    // 1) fileName: the name of the file with the data corresponding to file data
    // 2) found: always initialised to false, whether the above file exists
    // 3) processing: any additional processing to be performed on the raw text data
    const properties = {
      taskDescription: { fileName: 'Problem.md', found: false, processing: identity },
      starterCode: { fileName: 'StarterCode.js', found: false, processing: identity },
      savedCode: { fileName: 'SavedCode.js', found: false, processing: identity },
      testPrepend: { fileName: 'TestPrepend.js', found: false, processing: identity },
      testCases: { fileName: 'TestCases.json', found: false, processing: JSON.parse }
    };

    const propKeys = Object.keys(properties);

    // Figure out if the files exist
    for (let i = 0; i < folderContentsAsArray.length; i++) {
      const fileName = folderContentsAsArray[i].name;

      for (let j = 0; j < propKeys.length; j++) {
        const key = propKeys[j];
        if (fileName === properties[key].fileName) {
          properties[key].found = true;
          break;
        }
      }
    }

    try {
      for (let i = 0; i < propKeys.length; i++) {
        const key = propKeys[i];
        const value = properties[key];

        if (value.found) {
          taskData[key] = value.processing(
            await getContentAsString(
              repoOwner,
              repoName,
              questionFolderName + '/' + value.fileName,
              octokit
            )
          );
        }
      }

      if (taskData.savedCode === '') {
        taskData.savedCode = taskData.starterCode;
      }

      questions.push(taskData);
    } catch (err) {
      console.error(err);
    }
  }

  return questions;
}

/**
 * Retrieves content from a single file on GitHub and returns it in string form.
 *
 * @param repoOwner The owner of the mission repository
 * @param repoName The name of the mission repository
 * @param filepath The path to the file to be retrieved
 * @param octokit The Octokit instance for the authenticated user
 */
export async function getContentAsString(
  repoOwner: string,
  repoName: string,
  filepath: string,
  octokit: any
) {
  let contentString = '';

  try {
    const fileInfo = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filepath
    });

    contentString = Buffer.from((fileInfo.data as any).content, 'base64').toString();
  } catch (err) {
    console.error(err);
  }

  return contentString;
}

/**
 * Converts the contents of the '.metadata' file into a MissionMetadata object.
 *
 * @param metadataString The file contents of the '.metadata' file of a mission repository
 */
function convertMetadataStringToMissionMetadata(metadataString: string) {
  const missionMetadata: MissionMetadata = {
    coverImage: '',
    kind: '',
    number: '',
    title: '',
    sourceVersion: 1,
    dueDate: new Date(8640000000000000),
    reading: '',
    webSummary: ''
  };
  const stringPropsToExtract = ['coverImage', 'kind', 'number', 'title', 'reading', 'webSummary'];
  const numPropsToExtract = ['sourceVersion'];
  const datePropsToExtract = ['dueDate'];

  const retVal = parseMetadataProperties<MissionMetadata>(
    missionMetadata,
    stringPropsToExtract,
    numPropsToExtract,
    datePropsToExtract,
    metadataString
  );

  return retVal;
}

export function convertMissionMetadataToMetadataString(missionMetadata: MissionMetadata) {
  const properties: string[] = [
    'title',
    'coverImage',
    'webSummary',
    'dueDate',
    'kind',
    'number',
    'sourceVersion',
    'reading'
  ];
  const propertyValuePairs = properties.map(property => property + '=' + missionMetadata[property]);
  return propertyValuePairs.join('\n');
}

/**
 * Converts the contents of a '.metadata' file into an object of type R.
 *
 * @param propertyContainer The object of which properties will be set
 * @param stringProps An array containing the names of properties with string values
 * @param numProps An array containing the names of properties with numerical values
 * @param dateProps An array containing the names of properties with date values
 * @param metadataString The content of the '.metadata' file to be parsed
 */
export function parseMetadataProperties<R>(
  propertyContainer: R,
  stringProps: string[],
  numProps: string[],
  dateProps: string[],
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

    for (let i = 0; i < numProps.length; i++) {
      const propName = dateProps[i];

      if (line.startsWith(propName)) {
        propertyContainer[propName] = new Date(line.substr(propName.length + 1));
        return;
      }
    }
  });

  return propertyContainer;
}
