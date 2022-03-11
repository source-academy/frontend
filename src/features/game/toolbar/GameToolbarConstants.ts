import ImageAssets from '../assets/ImageAssets';
import { screenSize } from '../commons/CommonConstants';
import { AssetKey } from '../commons/CommonTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';

export type ToolbarButtonConfig = {
  assetKey: AssetKey;
  onUp: () => void;
};

// From rightmost to leftmost
const buttonConfigs: ToolbarButtonConfig[] = [
  {
    // Escape menu button
    assetKey: ImageAssets.gear.key,
    onUp: async () => {
      const globalAPI = GameGlobalAPI.getInstance();
      if (globalAPI.isCurrentPhase(GamePhaseType.EscapeMenu)) {
        await globalAPI.popPhase();
      } else if (globalAPI.isCurrentPhase(GamePhaseType.Dashboard)) {
        await globalAPI.swapPhase(GamePhaseType.EscapeMenu);
      } else {
        await globalAPI.pushPhase(GamePhaseType.EscapeMenu);
      }
    }
  },
  {
    // Dashboard button
    assetKey: ImageAssets.journal.key,
    onUp: async () => {
      const globalAPI = GameGlobalAPI.getInstance();
      if (globalAPI.isCurrentPhase(GamePhaseType.Dashboard)) {
        await globalAPI.popPhase();
      } else if (globalAPI.isCurrentPhase(GamePhaseType.EscapeMenu)) {
        await globalAPI.swapPhase(GamePhaseType.Dashboard);
      } else {
        await globalAPI.pushPhase(GamePhaseType.Dashboard);
      }
    }
  }
];

const ToolbarConstants = {
  firstButton: { x: screenSize.x - 37, y: 37 },
  xOffset: 64,
  buttonConfigs
};

export default ToolbarConstants;
