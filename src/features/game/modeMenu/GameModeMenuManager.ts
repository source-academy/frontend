import { GameButton, screenSize, shortButton } from 'src/features/game/commons/CommonsTypes';
import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import GameModeMenu from 'src/features/game/modeMenu/GameModeMenu';
import { modeButtonYPos, modeButtonStyle } from 'src/features/game/modeMenu/GameModeMenuTypes';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';

class GameModeMenuManager {
  static processModeMenus(
    gameManager: GameManager,
    chapter: GameChapter
  ): Map<string, GameModeMenu> {
    const mapModeMenus = new Map<string, GameModeMenu>();
    chapter.map.getLocations().forEach(location => {
      const modeMenus = new GameModeMenu();

      if (location.modes) {
        location.modes.forEach(mode => {
          const callback = this.getModeButtonCallback(gameManager, mode);
          GameModeMenuManager.addModeButton(modeMenus, mode, callback);
        });
      }

      mapModeMenus.set(location.name, modeMenus);
    });

    return mapModeMenus;
  }

  static getModeButtonCallback(gameManager: GameManager, mode: GameMode) {
    return () => gameManager.changeModeTo(mode);
  }

  static addModeButton(modeMenu: GameModeMenu, modeName: GameMode, callback: any) {
    const newNumberOfButtons = modeMenu.modeButtons.length + 1;
    const partitionSize = screenSize.x / newNumberOfButtons;

    const newXPos = partitionSize / 2;

    // Rearrange existing buttons
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
      assetKey: shortButton.key,
      assetXPos: newXPos + modeMenu.modeButtons.length * partitionSize,
      assetYPos: modeButtonYPos,
      isInteractive: true,
      onInteract: callback
    };

    // Update
    modeMenu.modeButtons.push(newModeButton);
  }
}

export default GameModeMenuManager;
