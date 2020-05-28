import { LINKS } from '../../../../utils/constants';
import { history } from '../../../../utils/history';
import { saveCollectible, saveQuest } from '../backend/gameState';
import { playSound } from '../soundManager/soundManager';

const hookHandlers = {
  startMission: () => history.push('/academy/missions'),
  startQuest: () => history.push('/academy/quests'),
  openTemplate: (name: string) => {
    switch (name) {
      case 'textbook':
        return window.open(LINKS.TEXTBOOK, '_blank');
      case 'announcements':
        return window.open(LINKS.LUMINUS);
      case 'assessments':
        return history.push('/academy/missions');
      case 'forum':
        return window.open(LINKS.PIAZZA);
      case 'materials':
        return history.push('/material');
      case 'IDE':
        return history.push('/playground');
      case 'path':
        return history.push('/academy/paths');
      case 'sourcecast':
        return history.push('/sourcecast');
      case 'about':
        return history.push('/contributors');
      default:
        return window.open(LINKS.LUMINUS);
    }
  },
  pickUpCollectible: saveCollectible,
  playSound,
  saveCompletedQuest: saveQuest
};

export default hookHandlers;
