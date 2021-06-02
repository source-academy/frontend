import { Octokit } from '@octokit/rest';
import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';

import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { MissionData, MissionMetadata, MissionRepoData, TaskData } from './GitHubMissionTypes';

export const maximumTasksPerMission = 20;

/**
 * Retrieves mission information - such as the briefings, questions, metadata etc. from a GitHub Repository.
 *
 * @param missionRepoData Repository information where the mission is stored
 * @param octokit The Octokit instance for the authenticated user
 */
export async function getMissionData(missionRepoData: MissionRepoData, octokit: Octokit) {
  const briefingStringPromise = getContentAsString(
    missionRepoData.repoOwner,
    missionRepoData.repoName,
    'README.md',
    octokit
  );

  const metadataStringPromise = getContentAsString(
    missionRepoData.repoOwner,
    missionRepoData.repoName,
    '.metadata',
    octokit
  );

  const tasksDataPromise = getTasksData(
    missionRepoData.repoOwner,
    missionRepoData.repoName,
    octokit
  );

  const [briefingString, metadataString, tasksData] = await Promise.all([
    briefingStringPromise,
    metadataStringPromise,
    tasksDataPromise
  ]);
  const missionMetadata = convertMetadataStringToMissionMetadata(metadataString);

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
async function getTasksData(repoOwner: string, repoName: string, octokit: Octokit) {
  const questions: TaskData[] = [];

  if (octokit === undefined) {
    return questions;
  }

  // Get files in root
  type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
  const rootFolderContents: GetContentResponse = await octokit.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path: ''
  });

  type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
  const files: GetContentData = rootFolderContents.data;

  if (!Array.isArray(files)) {
    return questions;
  }

  const promises = [];

  for (let i = 1; i <= maximumTasksPerMission; i++) {
    const questionFolderName = 'Q' + i;

    // We make the assumption that there are no gaps in question numbering
    // If the question does not exist, we may break
    if (files.find(file => file.name === questionFolderName) === undefined) {
      break;
    }

    promises.push(
      octokit.repos
        .getContent({
          owner: repoOwner,
          repo: repoName,
          path: questionFolderName
        })
        .then((folderContents: GetContentResponse) => {
          if (!Array.isArray(folderContents.data)) {
            return;
          }

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
            testPostpend: { fileName: 'TestPostpend.js', found: false, processing: identity },
            testCases: { fileName: 'TestCases.json', found: false, processing: JSON.parse }
          };

          const propKeys = Object.keys(properties);

          // Figure out if the files exist
          for (let j = 0; j < folderContentsAsArray.length; j++) {
            const fileName = folderContentsAsArray[j].name;

            for (let k = 0; k < propKeys.length; k++) {
              const key = propKeys[k];
              if (fileName === properties[key].fileName) {
                properties[key].found = true;
                break;
              }
            }
          }

          const stringContentPromises: Promise<string>[] = [];
          const fileNameToIndexMap = {};
          let arrayIndex = 0;

          for (let m = 0; m < propKeys.length; m++) {
            const key = propKeys[m];
            const value = properties[key];

            if (value.found) {
              stringContentPromises.push(
                getContentAsString(
                  repoOwner,
                  repoName,
                  questionFolderName + '/' + value.fileName,
                  octokit
                ).then((stringContent: string) => value.processing(stringContent))
              );
              fileNameToIndexMap[key] = arrayIndex;
              arrayIndex++;
            }
          }

          return Promise.all(stringContentPromises).then((stringContents: string[]) => {
            const taskData: TaskData = {
              questionNumber: i,
              taskDescription: '',
              starterCode: '',
              savedCode: '',
              testPrepend: '',
              testPostpend: '',
              testCases: []
            };

            const foundFileNames = Object.keys(fileNameToIndexMap);

            foundFileNames.forEach((fileName: string) => {
              taskData[fileName] = stringContents[fileNameToIndexMap[fileName]];
            });

            if (taskData.savedCode === '') {
              taskData.savedCode = taskData.starterCode;
            }

            questions.push(taskData);
          });
        })
        .catch(err => {
          showWarningMessage('Error occurred while trying to retrieve file content', 1000);
          console.error(err);
        })
    );
  }
  await Promise.all(promises);
  questions.sort((a, b) => a.questionNumber - b.questionNumber);

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
  octokit: Octokit
) {
  let contentString = '';

  if (octokit === undefined) {
    return contentString;
  }

  try {
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const fileInfo: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filepath
    });

    contentString = Buffer.from((fileInfo.data as any).content, 'base64').toString();
  } catch (err) {
    showWarningMessage('Error occurred while trying to retrieve file content', 1000);
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

    for (let i = 0; i < dateProps.length; i++) {
      const propName = dateProps[i];
      if (line.startsWith(propName)) {
        propertyContainer[propName] = new Date(line.substr(propName.length + 1));
        return;
      }
    }
  });

  return propertyContainer;
}
