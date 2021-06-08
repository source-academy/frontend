import { Octokit } from '@octokit/rest';
import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import { isEqual } from 'lodash';

import { showWarningMessage } from '../../commons/utils/NotificationsHelper';
import { IMCQQuestion, Testcase } from '../assessment/AssessmentTypes';
import { MissionData, MissionMetadata, MissionRepoData, TaskData } from './GitHubMissionTypes';

export const maximumTasksPerMission = 20;

const jsonStringify = (object: any) => JSON.stringify(object, null, 4);
const identity = (content: any) => content;

// 1) fileName: the name of the file corresponding to the named property
// 2) isDefaultValue: function should return true if the input value is the default value of the property
// 3) fromStringConverter: a function to be applied to raw text data to convert it into the property
// 4) toStringConverter: a function to be applied to the property to convert it to raw text data
const taskDataPropertyTable = {
  taskDescription: {
    fileName: 'Problem.md',
    isDefaultValue: (value: string) => value === '',
    fromStringConverter: identity,
    toStringConverter: identity
  },
  starterCode: {
    fileName: 'StarterCode.js',
    isDefaultValue: (value: string) => value === '',
    fromStringConverter: identity,
    toStringConverter: identity
  },
  savedCode: {
    fileName: 'SavedCode.js',
    isDefaultValue: (value: string) => value === '',
    fromStringConverter: identity,
    toStringConverter: identity
  },
  testPrepend: {
    fileName: 'TestPrepend.js',
    isDefaultValue: (value: string) => value === '',
    fromStringConverter: identity,
    toStringConverter: identity
  },
  testPostpend: {
    fileName: 'TestPostpend.js',
    isDefaultValue: (value: string) => value === '',
    fromStringConverter: identity,
    toStringConverter: identity
  },
  testCases: {
    fileName: 'TestCases.json',
    isDefaultValue: (value: Testcase[]) => value.length === 0,
    fromStringConverter: JSON.parse,
    toStringConverter: jsonStringify
  }
};

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

          const folderContentsAsArray = folderContents.data as any[];

          const properties = Object.keys(taskDataPropertyTable);

          const propertyFileFound = {};
          properties.forEach((propertyName: string) => {
            propertyFileFound[propertyName] = false;
          });

          // Figure out if the files exist
          folderContentsAsArray.forEach((folderContent: any) => {
            const fileName = folderContent.name;

            for (let k = 0; k < properties.length; k++) {
              const property = properties[k];
              if (fileName === taskDataPropertyTable[property].fileName) {
                propertyFileFound[property] = true;
                break;
              }
            }
          });

          const stringContentPromises: Promise<string>[] = [];
          const propertyNameToIndexMap = {};
          let arrayIndex = 0;

          properties.forEach((propertyName: string) => {
            const fileName = taskDataPropertyTable[propertyName].fileName;
            const found = propertyFileFound[propertyName];

            if (found) {
              stringContentPromises.push(
                getContentAsString(
                  repoOwner,
                  repoName,
                  questionFolderName + '/' + fileName,
                  octokit
                ).then((stringContent: string) =>
                  taskDataPropertyTable[propertyName].fromStringConverter(stringContent)
                )
              );

              propertyNameToIndexMap[propertyName] = arrayIndex;
              arrayIndex++;
            }
          });

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

            const foundProperties = Object.keys(propertyNameToIndexMap);

            foundProperties.forEach((propertyName: string) => {
              taskData[propertyName] = stringContents[propertyNameToIndexMap[propertyName]];
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

function convertMissionMetadataToMetadataString(missionMetadata: MissionMetadata) {
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

/**
 * Discovers files to be changed when saving to an existing GitHub repository
 * Return value is an array in the format [filenameToContentMap, foldersToDelete]
 * filenameToContentMap is an object whose key-value pairs are filenames and their new contents
 * foldersToDelete is an array containing the names of folders
 * @param missionMetadata The current MissionMetadata
 * @param cachedMissionMetadata The cached MissionMetadata
 * @param briefingContent The current briefing
 * @param cachedBriefingContent The cached briefing
 * @param taskList The current taskList
 * @param cachedTaskList The cached taskList
 * @param isTeacherMode If this is true, any changes to the saved code will be made to starter code instead
 */
export function discoverFilesToBeChangedWithMissionRepoData(
  missionMetadata: MissionMetadata,
  cachedMissionMetadata: MissionMetadata,
  briefingContent: string,
  cachedBriefingContent: string,
  taskList: TaskData[],
  cachedTaskList: TaskData[],
  isTeacherMode: boolean
): [any, string[]] {
  const filenameToContentMap = {};
  const foldersToDelete: string[] = [];

  if (missionMetadata !== cachedMissionMetadata) {
    filenameToContentMap['.metadata'] = convertMissionMetadataToMetadataString(missionMetadata);
  }

  if (briefingContent !== cachedBriefingContent) {
    filenameToContentMap['README.md'] = briefingContent;
  }

  let i = 0;
  while (i < taskList.length) {
    const taskNumber = i + 1;
    const questionFolderName = 'Q' + taskNumber;

    if (taskNumber > cachedTaskList.length) {
      // Look for files to create
      filenameToContentMap[questionFolderName + '/StarterCode.js'] = taskList[i].savedCode;
      filenameToContentMap[questionFolderName + '/Problem.md'] = taskList[i].taskDescription;

      const propertiesToCheck = ['testCases', 'testPrepend', 'testPostpend'];

      for (const propertyName of propertiesToCheck) {
        const currentValue = taskList[i][propertyName];
        const isDefaultValue = taskDataPropertyTable[propertyName].isDefaultValue(currentValue);

        if (!isDefaultValue) {
          const onRepoFileName =
            questionFolderName + '/' + taskDataPropertyTable[propertyName].fileName;
          const stringContent = taskDataPropertyTable[propertyName].toStringConverter(
            taskList[i][propertyName]
          );

          filenameToContentMap[onRepoFileName] = stringContent;
        }
      }
    } else {
      // Look for files to edit
      const propertiesToCheck = Object.keys(taskDataPropertyTable);

      for (const propertyName of propertiesToCheck) {
        const currentValue = taskList[i][propertyName];
        const cachedValue = cachedTaskList[i][propertyName];

        if (!isEqual(currentValue, cachedValue)) {
          const onRepoFileName =
            questionFolderName + '/' + taskDataPropertyTable[propertyName].fileName;
          const stringContent = taskDataPropertyTable[propertyName].toStringConverter(
            taskList[i][propertyName]
          );

          filenameToContentMap[onRepoFileName] = stringContent;
        }
      }

      if (
        isTeacherMode &&
        filenameToContentMap[questionFolderName + '/' + taskDataPropertyTable['savedCode'].fileName]
      ) {
        // replace changes to savedCode with changes to starterCode
        const savedCodeValue =
          filenameToContentMap[
            questionFolderName + '/' + taskDataPropertyTable['savedCode'].fileName
          ];
        delete filenameToContentMap[
          questionFolderName + '/' + taskDataPropertyTable['savedCode'].fileName
        ];
        filenameToContentMap[
          questionFolderName + '/' + taskDataPropertyTable['starterCode'].fileName
        ] = savedCodeValue;
      }
    }
    i++;
  }

  while (i < cachedTaskList.length) {
    const taskNumber = i + 1;
    foldersToDelete.push('Q' + taskNumber);
    i++;
  }

  return [filenameToContentMap, foldersToDelete];
}

/**
 * Discovers files to be changed when saving to a new GitHub repository
 * @param missionMetadata The current MissionMetadata
 * @param briefingContent The current briefing
 * @param taskList The current taskList
 */
export function discoverFilesToBeCreatedWithoutMissionRepoData(
  missionMetadata: MissionMetadata,
  briefingContent: string,
  taskList: TaskData[]
) {
  const filenameToContentMap = {};
  filenameToContentMap['.metadata'] = convertMissionMetadataToMetadataString(missionMetadata);
  filenameToContentMap['README.md'] = briefingContent;

  const propertiesToCheck = ['testCases', 'testPrepend', 'testPostpend'];

  for (let i = 0; i < taskList.length; i++) {
    const taskNumber = i + 1;
    const questionFolderName = 'Q' + taskNumber;

    filenameToContentMap[questionFolderName + '/' + taskDataPropertyTable['starterCode'].fileName] =
      taskList[i].savedCode;
    filenameToContentMap[
      questionFolderName + '/' + taskDataPropertyTable['taskDescription'].fileName
    ] = taskList[i].taskDescription;

    propertiesToCheck.forEach((propertyName: string) => {
      const currentValue = taskList[i][propertyName];
      const isDefaultValue = taskDataPropertyTable[propertyName].isDefaultValue(currentValue);

      if (!isDefaultValue) {
        const onRepoFileName =
          questionFolderName + '/' + taskDataPropertyTable[propertyName].fileName;
        const stringContent = taskDataPropertyTable[propertyName].toStringConverter(
          taskList[i][propertyName]
        );

        filenameToContentMap[onRepoFileName] = stringContent;
      }
    });
  }

  return filenameToContentMap;
}

/**
 * Checks if the textual contents of a GitHub-hosted file is for an MCQ question, and converts it if so
 * returns an array of 2 values, a boolean and an IMCQQuestion
 * The boolean specifies whether the input corresponded to an MCQQuestion
 * The IMCQQuestion is only meaningful if the boolean is true, and contains the converted information
 * @param possibleMCQText The text to be checked and converted
 */
export function convertToMCQQuestionIfMCQText(possibleMCQText: string): [boolean, IMCQQuestion] {
  let isMCQText = false;
  const mcqQuestion = {
    answer: 0,
    choices: [],
    solution: -1,
    type: 'mcq',
    content: '',
    grade: 0,
    id: 0,
    library: { chapter: 4, external: { name: 'NONE', symbols: [] }, globals: [] },
    maxGrade: 0,
    xp: 0,
    maxXp: 0
  } as IMCQQuestion;

  if (possibleMCQText.substring(0, 3).toLowerCase() === 'mcq') {
    isMCQText = true;
  }

  if (isMCQText) {
    const onlyQuestionInformation = possibleMCQText.substring(3, possibleMCQText.length);
    try {
      const intermediateObject = JSON.parse(onlyQuestionInformation);

      const studentAnswer = intermediateObject.answer;
      const questions = intermediateObject.questions as any[];
      const choices = questions.map((question: { solution: string; hint: string }) => {
        return {
          content: question.solution,
          hint: question.hint
        };
      });

      mcqQuestion.answer = studentAnswer;
      mcqQuestion.choices = choices;
    } catch (err) {
      isMCQText = false;
    }
  }

  return [isMCQText, mcqQuestion];
}

/**
 * Converts an IMCQQuestion object into textual contents to be saved to a GitHub repository
 * @param mcq The IMCQQuestion object
 */
export function convertIMCQQuestionToMCQText(mcq: IMCQQuestion) {
  const studentAnswer = mcq.answer;
  const questions = mcq.choices.map((choice: { content: string; hint: string | null }) => {
    return {
      solution: choice.content,
      hint: choice.hint
    };
  });

  const json = {
    questions: questions,
    answer: studentAnswer
  };

  return 'MCQ\n' + jsonStringify(json);
}
