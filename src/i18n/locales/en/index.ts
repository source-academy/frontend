import commons from './commons.json';
import grading from './grading.json';
import login from './login.json';
import sessionManagement from './sessionManagement.json';
import sicp from './sicp.json';
import substVisualizer from './sideContent/substVisualizer.json';
import sourcecast from './sourcecast.json';
import sourceRecorder from './sourceRecorder.json';
import stories from './stories.json';
import welcome from './welcome.json';

export default {
  commons,
  login,
  translation: {
    ...grading,
    ...sessionManagement,
    ...sicp,
    ...sourcecast,
    ...sourceRecorder,
    ...stories,
    ...welcome
  },
  sideContent: {
    substVisualizer
  }
};
