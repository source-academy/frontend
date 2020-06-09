import { GameMode } from '../GameModeTypes';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import GameModeMove from './GameModeMove';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { GameLocation } from '../../location/GameMapTypes';
import { GameButton, screenSize, longButton } from '../../commons/CommonsTypes';
import { moveButtonStyle, moveButtonXPos } from './GameModeMoveTypes';

class GameModeMoveManager {
  static processMoveMenus(
    gameManager: GameManager,
    chapter: GameChapter
  ): Map<string, GameModeMove> {
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
          GameModeMoveManager.addMoveOptionButton(moveMenu, location, () => {
            // tslint:disable-next-line
            console.log('Moving to ', locationName);
          });
        }
      });

      mapMoveMenus.set(location.name, moveMenu);
    });

    return mapMoveMenus;
  }

  static addMoveOptionButton(moveMenu: GameModeMove, location: GameLocation, callback: any) {
    const newNumberOfButtons = moveMenu.possibleLocations.length + 1;
    const partitionSize = screenSize.y / newNumberOfButtons;

    const newYPos = partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < moveMenu.possibleLocations.length; i++) {
      moveMenu.possibleLocations[i] = {
        ...moveMenu.possibleLocations[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: location.name,
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
