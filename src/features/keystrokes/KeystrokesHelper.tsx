import { isEqual } from 'lodash';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Input, PlaybackData } from '../sourceRecorder/SourceRecorderTypes';

const oneByteInBits = 8;
const oneKbInBytes = 1024;
const fiveMbInKb = 5 * 1024;

export type UnsentLog = {
  assessmentId: number;
  questionId: number; 
  playbackData: PlaybackData;
}

const getSessionStorageSpace = () => {
  let allStrings = '';
  for (const key in window.sessionStorage) {
    if (window.sessionStorage.hasOwnProperty(key)) {
      allStrings += window.sessionStorage[key];
    }
  }
  return allStrings ? 3 + (allStrings.length * 16) / (oneByteInBits * oneKbInBytes) : 0;
};

export const hasExceededLocalStorageSpace = () => {
  return (
    getSessionStorageSpace() > fiveMbInKb ||
    getPlaygroundLogs().inputs.length + getAssessmentLogs().inputs.length >= 1000
  );
};

export const getUnsentLogs = () => {
  const unsentLogsAsString: string | null = localStorage.getItem("unsentLogs");
  const unsentLogs: UnsentLog[] = JSON.parse(unsentLogsAsString ? unsentLogsAsString : JSON.stringify([]));
  console.log(unsentLogs);
  return unsentLogs;
}

export const saveUnsentLog = (assessmentId: number, questionId: number, playbackData: PlaybackData) => {
  const unsentLogs: UnsentLog[] = getUnsentLogs();

  const newUnsentLog: UnsentLog = {
    assessmentId: assessmentId, 
    questionId: questionId, 
    playbackData: playbackData
  };

  unsentLogs.push(newUnsentLog);
  localStorage.setItem("unsentLogs", JSON.stringify(unsentLogs));
}

export const clearUnsentLogs = () => {
  localStorage.setItem("unsentLogs", JSON.stringify("[]"));
}

export const playgroundQuestionId: number = -1;

export const resetAllPlaygroundLogs = () => {
  const playgroundLogs: string | null = sessionStorage.getItem('PlaygroundLogs');
  const playgroundPlayback: PlaybackData = JSON.parse(
    playgroundLogs ? playgroundLogs : JSON.stringify(defaultPlaybackData)
  );
  playgroundPlayback.inputs = [];

  sessionStorage.setItem('PlaygroundLogs', JSON.stringify(playgroundPlayback));
}

export const resetPlaygroundLogging = () => {
  const playgroundLogs: string | null = sessionStorage.getItem('PlaygroundLogs');
  const playgroundPlayback: PlaybackData = JSON.parse(
    playgroundLogs ? playgroundLogs : JSON.stringify(defaultPlaybackData)
  );
  const lastInputs = getLastPlaygroundInputs();
  const newInit = {
    chapter: lastInputs.chapter,
    externalLibrary: lastInputs.externalLibrary,
    editorValue: lastInputs.editorValue
  };
  if (!isEqual(playgroundPlayback.init, newInit)) {
    playgroundPlayback.init = newInit;
  }
  playgroundPlayback.inputs = getPlaygroundLogs().inputs.splice(0, lastInputs.lastIndex);
  sessionStorage.setItem('PlaygroundLogs', JSON.stringify(playgroundPlayback));
};

export const setResetLoggingFlag = (flag: boolean) => {
  sessionStorage.setItem('LoggingFlag', JSON.stringify(flag));
};

export const getResetLoggingFlag = () => {
  const loggingFlag: string | null = sessionStorage.getItem('LoggingFlag');
  return JSON.parse(loggingFlag ? loggingFlag : 'false');
};

export const setLastPlaygroundInputs = (
  chapter: number,
  externalLibrary: ExternalLibraryName,
  editorValue: string
) => {
  const lastIndex = getPlaygroundLogs().inputs.length;
  const lastInputs = {
    chapter: chapter,
    externalLibrary: externalLibrary,
    editorValue: editorValue,
    lastIndex: lastIndex
  };
  sessionStorage.setItem('LastPlaygroundIndex', JSON.stringify(lastInputs));
};

export const getLastPlaygroundInputs = () => {
  const lastInputs = sessionStorage.getItem('LastPlaygroundIndex');
  const lastInputsAsObject = JSON.parse(lastInputs ? lastInputs : '0');
  return lastInputsAsObject;
};

export const savePlaygroundLog = (newInput: Input) => {
  const playgroundLogs: string | null = sessionStorage.getItem('PlaygroundLogs');
  const playgroundPlayback: PlaybackData = JSON.parse(
    playgroundLogs ? playgroundLogs : JSON.stringify(defaultPlaybackData)
  );
  playgroundPlayback.inputs.push(newInput);
  sessionStorage.setItem('PlaygroundLogs', JSON.stringify(playgroundPlayback));
};

export const getPlaygroundLogs = () => {
  const playgroundLogs: string | null = sessionStorage.getItem('PlaygroundLogs');
  const playgroundPlayback: PlaybackData = JSON.parse(
    playgroundLogs ? playgroundLogs : JSON.stringify(defaultPlaybackData)
  );

  return playgroundPlayback;
};

export const resetAllAssessmentLogs = () => {
  const assessmentLogs: string | null = sessionStorage.getItem('AssessmentLogs');
  const assessmentPlayback: PlaybackData = JSON.parse(
    assessmentLogs ? assessmentLogs : JSON.stringify(defaultPlaybackData)
  );
  assessmentPlayback.inputs = [];

  sessionStorage.setItem('AssessmentLogs', JSON.stringify(assessmentPlayback));
}

export const resetAssessmentLogging = () => {
  const assessmentLogs: string | null = sessionStorage.getItem('AssessmentLogs');
  const assessmentPlayback: PlaybackData = JSON.parse(
    assessmentLogs ? assessmentLogs : JSON.stringify(defaultPlaybackData)
  );
  const lastInputs = getLastAssessmentInputs();
  const newInit = {
    chapter: lastInputs.chapter,
    externalLibrary: lastInputs.externalLibrary,
    editorValue: lastInputs.editorValue
  };
  if (!isEqual(assessmentPlayback.init, newInit)) {
    assessmentPlayback.init = newInit;
  }
  assessmentPlayback.inputs = getAssessmentLogs().inputs.splice(0, lastInputs.lastIndex);

  sessionStorage.setItem('AssessmentLogs', JSON.stringify(assessmentPlayback));
};

export const setLastAssessmentInputs = (
  chapter: number,
  externalLibrary: ExternalLibraryName,
  editorValue: string
) => {
  const lastIndex = getAssessmentLogs().inputs.length;
  const lastInputs = {
    chapter: chapter,
    externalLibrary: externalLibrary,
    editorValue: editorValue,
    lastIndex: lastIndex
  };
  sessionStorage.setItem('LastAssessmentLogIndex', JSON.stringify(lastInputs));
};

export const getLastAssessmentInputs = () => {
  const lastInputs = sessionStorage.getItem('LastAssessmentLogIndex');
  const lastInputsAsObject = JSON.parse(lastInputs ? lastInputs : '0');
  return lastInputsAsObject;
};

export const saveAssessmentLog = (newInput: Input) => {
  const assessmentLogs: string | null = sessionStorage.getItem('AssessmentLogs');
  const assessmentPlayback: PlaybackData = JSON.parse(
    assessmentLogs ? assessmentLogs : JSON.stringify(defaultPlaybackData)
  );
  assessmentPlayback.inputs.push(newInput);
  sessionStorage.setItem('AssessmentLogs', JSON.stringify(assessmentPlayback));
};

export const getAssessmentLogs = () => {
  const assessmentLogs: string | null = sessionStorage.getItem('AssessmentLogs');
  const assessmentPlayback: PlaybackData = JSON.parse(
    assessmentLogs ? assessmentLogs : JSON.stringify(defaultPlaybackData)
  );
  return assessmentPlayback;
};

export const saveLoggedAssessmentIds = (assessmentId: number, questionId: number) => {
  const questionParamsString: string | null = sessionStorage.getItem('LoggedAssessmentIds');
  const questionParams = JSON.parse(
    questionParamsString ? questionParamsString : JSON.stringify(defaultAssessmentIds)
  );
  questionParams.assessmentId = assessmentId;
  questionParams.questionId = questionId;
  sessionStorage.setItem('LoggedAssessmentIds', JSON.stringify(questionParams));
};

export const getLoggedAssessmentIds = () => {
  const questionParamsString: string | null = sessionStorage.getItem('LoggedAssessmentIds');
  const questionParams = JSON.parse(
    questionParamsString ? questionParamsString : JSON.stringify(defaultAssessmentIds)
  );
  return questionParams;
};

const defaultAssessmentIds = {
  assessmentId: playgroundQuestionId,
  questionId: playgroundQuestionId
};

const defaultPlaybackData: PlaybackData = {
  init: {
    chapter: 1,
    externalLibrary: ExternalLibraryName.NONE,
    editorValue: ''
  },
  inputs: []
};
