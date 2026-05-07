import commons from './commons';
import grading from './grading';
import login from './login';
import autograder from './sideContent/autograder';
import contestLeaderboard from './sideContent/contestLeaderboard';
import contestVoting from './sideContent/contestVoting';
import cseMachine from './sideContent/cseMachine';
import dataVisualizer from './sideContent/dataVisualizer';
import faceapiDisplay from './sideContent/faceapiDisplay';
import htmlDisplay from './sideContent/htmlDisplay';
import resultCard from './sideContent/resultCard';
import sessionManagement from './sideContent/sessionManagement';
import substVisualizer from './sideContent/substVisualizer';
import upload from './sideContent/upload';
import welcome from './welcome';

export default {
  commons,
  login,
  translation: {
    ...grading,
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
