import { GameButton, screenSize } from 'src/features/game/commons/CommonsTypes';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import GameModeMenu from 'src/features/game/modeMenu/GameModeMenu';
import {
  modeButton,
  modeButtonYPos,
  modeButtonStyle
} from 'src/features/game/modeMenu/GameModeMenuTypes';

class GameModeMenuManager {
  static processModeMenus(chapter: GameChapter): Map<string, GameModeMenu> {
    const mapModeMenus = new Map<string, GameModeMenu>();
    chapter.map.getLocations().forEach(location => {
      const modeMenus = new GameModeMenu();

      if (location.modes) {
        location.modes.forEach(mode => GameModeMenuManager.addModeButton(modeMenus, mode));
      }

      // By default, we include Move mode
      GameModeMenuManager.addModeButton(modeMenus, GameMode.Move);

      mapModeMenus.set(location.name, modeMenus);
    });

    return mapModeMenus;
  }

  // TODO: Consider functional form, no mutation
  static addModeButton(modeMenu: GameModeMenu, modeName: GameMode) {
    const newNumberOfButtons = modeMenu.modeButtons.length + 1;
    const partitionSize = screenSize.x / newNumberOfButtons;

    const newXPos = partitionSize / 2;

    for (let i = 0; i < modeMenu.modeButtons.length; i++) {
      modeMenu.modeButtons[i] = {
        ...modeMenu.modeButtons[i],
        assetXPos: newXPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: modeName,
      style: modeButtonStyle,
      assetKey: modeButton.key,
      assetXPos: newXPos + modeMenu.modeButtons.length * partitionSize,
      assetYPos: modeButtonYPos
    };
    modeMenu.modeButtons.push(newModeButton);
  }
}

export default GameModeMenuManager;
