// import { isEqual } from 'lodash';

import { v4 as uuid } from 'uuid';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Input as RecorderInput, PlaybackData } from '../sourceRecorder/SourceRecorderTypes';
export type UnsentLog = {
  assessmentId: number;
  questionId: number;
  playbackData: PlaybackData;
};

export const playgroundQuestionId: number = -1;


type PlaybackInitial = {
  chapter: number;
  externalLibrary: ExternalLibraryName;
  editorValue: string;
}

type PlaybackInitialTagged = PlaybackInitial & { assessmentId: number; type: "init" };
type Input = RecorderInput | PlaybackInitialTagged;

export function log(id: string, input: Input) {
  // TODO: lob it into indexedDB.
  // TODO: disable logging if not logged in.
  console.log(id, input);
}


// Creates a session, then logs it.
export function initSession(assessmentId: number, initialState: PlaybackInitial): string {
  const id = uuid();
  log(id, { ...initialState, assessmentId, type: "init" });
  return id;
}