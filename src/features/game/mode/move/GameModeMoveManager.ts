import { GameMode } from '../GameModeTypes';
import GameModeMove from './GameModeMove';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { GameButton, screenSize, longButton } from '../../commons/CommonsTypes';
import { moveButtonYSpace, moveButtonStyle, moveButtonXPos } from './GameModeMoveTypes';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';

class GameModeMoveManager {
  static processMoveMenus(chapter: GameChapter): Map<string, GameModeMove> {
    const mapMoveMenus = new Map<string, GameModeMove>();
    chapter.map.getLocations().forEach(location => {
      if (!location.modes || !location.modes.find(mode => mode === GameMode.Move)) {
        return;
      }

      const moveMenu = new GameModeMove();
      const possibleLocations = chapter.map.getNavigationFrom(location.name);
      if (!possibleLocations) {
        return;
      }

      possibleLocations.forEach(locationName => {
        const location = chapter.map.getLocation(locationName);
        if (location) {
          GameModeMoveManager.addMoveOptionButton(moveMenu, location.name, () => {
            GameActionManager.getInstance().changeLocationTo(locationName);
          });
          moveMenu.locationAssetKeys.set(locationName, location.assetKey);
        }
      });

      mapMoveMenus.set(location.name, moveMenu);
    });

    return mapMoveMenus;
  }

  static addMoveOptionButton(moveMenu: GameModeMove, name: string, callback: any) {
    const newNumberOfButtons = moveMenu.possibleLocations.length + 1;
    const partitionSize = moveButtonYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - moveButtonYSpace) / 2 + partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < moveMenu.possibleLocations.length; i++) {
      moveMenu.possibleLocations[i] = {
        ...moveMenu.possibleLocations[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: name,
      style: moveButtonStyle,
      assetKey: longButton.key,
      assetXPos: moveButtonXPos,
      assetYPos: newYPos + moveMenu.possibleLocations.length * partitionSize,
      isInteractive: true,
      onInteract: callback
    };

    // Update
    moveMenu.possibleLocations.push(newModeButton);
  }
}

export default GameModeMoveManager;
