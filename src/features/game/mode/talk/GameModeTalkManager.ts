import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeTalk from './GameModeTalk';
import { GameMode, backText } from '../GameModeTypes';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';
import { talkButtonYSpace, talkButtonStyle, talkOptButton } from './GameModeTalkTypes';
import { screenSize, GameButton } from '../../commons/CommonsTypes';

class GameModeTalkManager {
  static processTalkMenus(chapter: GameChapter): Map<string, GameModeTalk> {
    const mapTalkMenus = new Map<string, GameModeTalk>();
    chapter.map.getLocations().forEach(location => {
      if (!location.modes || !location.modes.find(mode => mode === GameMode.Talk)) {
        return;
      }

      const talkMenu = new GameModeTalk();
      const possibleTopics = chapter.map.getTalkTopicsAt(location.name);
      if (!possibleTopics) {
        return;
      }

      possibleTopics.forEach(topic => {
        GameModeTalkManager.addTopicOptionButton(talkMenu, topic, () => {
          // tslint:disable-next-line
          console.log('Triggering ', topic);
        });
      });

      // Add a back button
      GameModeTalkManager.addTopicOptionButton(talkMenu, backText, () => {
        GameActionManager.getInstance().changeModeTo(GameMode.Menu);
      });
      mapTalkMenus.set(location.name, talkMenu);
    });

    return mapTalkMenus;
  }

  static addTopicOptionButton(talkMenu: GameModeTalk, name: string, callback: any) {
    const newNumberOfButtons = talkMenu.possibleTopics.length + 1;
    const partitionSize = talkButtonYSpace / newNumberOfButtons;
    const newYPos = (screenSize.y - talkButtonYSpace) / 2 + partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < talkMenu.possibleTopics.length; i++) {
      talkMenu.possibleTopics[i] = {
        ...talkMenu.possibleTopics[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: name,
      style: talkButtonStyle,
      assetKey: talkOptButton.key,
      assetXPos: talkOptButton.xPos,
      assetYPos: newYPos + talkMenu.possibleTopics.length * partitionSize,
      isInteractive: true,
      onInteract: callback
    };

    // Update
    talkMenu.possibleTopics.push(newModeButton);
  }
}

export default GameModeTalkManager;
