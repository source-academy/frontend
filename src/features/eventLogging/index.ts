// import { isEqual } from 'lodash';

// import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { /*Input,*/ PlaybackData } from '../sourceRecorder/SourceRecorderTypes';

export type UnsentLog = {
  assessmentId: number;
  questionId: number;
  playbackData: PlaybackData;
};

export const playgroundQuestionId: number = -1;

// const defaultPlaybackData: PlaybackData = {
//   init: {
//     chapter: 1,
//     externalLibrary: ExternalLibraryName.NONE,
//     editorValue: ''
//   },
//   inputs: []
// };
