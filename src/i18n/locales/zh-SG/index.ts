import commons from './commons.json';
import grading from './grading.json';
import login from './login.json';
import autograder from './sideContent/autograder.json';
import contestLeaderboard from './sideContent/contestLeaderboard.json';
import contestVoting from './sideContent/contestVoting.json';
import cseMachine from './sideContent/cseMachine.json';
import dataVisualizer from './sideContent/dataVisualizer.json';
import faceapiDisplay from './sideContent/faceapiDisplay.json';
import htmlDisplay from './sideContent/htmlDisplay.json';
import resultCard from './sideContent/resultCard.json';
import sessionManagement from './sideContent/sessionManagement.json';
import substVisualizer from './sideContent/substVisualizer.json';
import upload from './sideContent/upload.json';
import sourcecast from './sourcecast.json';
import sourceRecorder from './sourceRecorder.json';
import stories from './stories.json';
import welcome from './welcome.json';

export default {
  commons,
  login,
  translation: {
    ...grading,
    ...sourcecast,
    ...sourceRecorder,
    ...stories,
    ...welcome
  },
  sideContent: {
    autograder,
    contestLeaderboard,
    contestVoting,
    cseMachine,
    dataVisualizer,
    faceapiDisplay,
    htmlDisplay,
    resultCard,
    sessionManagement,
    substVisualizer,
    upload
  }
};
