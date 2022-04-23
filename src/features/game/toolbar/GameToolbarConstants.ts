import ImageAssets from '../assets/ImageAssets';
import { screenSize } from '../commons/CommonConstants';
import { AssetKey, IBaseScene } from '../commons/CommonTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';

export type ToolbarButtonConfig = {
  assetKey: AssetKey;
  onUp: (scene: IBaseScene) => () => void;
};

// From rightmost to leftmost
const buttonConfigs: ToolbarButtonConfig[] = [
  {
    // Escape menu button
    assetKey: ImageAssets.gear.key,
    onUp: scene => async () => {
      const phaseManager = scene.getPhaseManager();
      if (phaseManager.isCurrentPhase(GamePhaseType.EscapeMenu)) {
        await phaseManager.popPhase();
      } else if (phaseManager.isCurrentPhaseTerminal()) {
        await phaseManager.swapPhase(GamePhaseType.EscapeMenu);
      } else {
        await phaseManager.pushPhase(GamePhaseType.EscapeMenu);
      }
    }
  },
  {
    // Dashboard button
    assetKey: ImageAssets.journal.key,
    onUp: scene => async () => {
      const phaseManager = scene.getPhaseManager();
      if (phaseManager.isCurrentPhase(GamePhaseType.Dashboard)) {
        await phaseManager.popPhase();
      } else if (phaseManager.isCurrentPhaseTerminal()) {
        await phaseManager.swapPhase(GamePhaseType.Dashboard);
      } else {
        await phaseManager.pushPhase(GamePhaseType.Dashboard);
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
