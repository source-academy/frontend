import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';

import CommonBackButton from '../../commons/CommonBackButton';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { createEmptySaveState } from '../../save/GameSaveConstants';
import { FullSaveState } from '../../save/GameSaveTypes';
import GameSoundManager from '../../sound/GameSoundManager';

type AchievementsProps = {
  fullSaveState: FullSaveState;
};

/**
 * This scenes display all students achievement.
 */
class Achievements extends Phaser.Scene {
  public fullSaveState: FullSaveState;

  public layerManager: GameLayerManager;
  public soundManager: GameSoundManager;
  public inputManager: GameInputManager;

  constructor() {
    super('Achievements');
    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.inputManager = new GameInputManager();
    this.fullSaveState = createEmptySaveState();
  }

  public init({ fullSaveState }: AchievementsProps) {
    this.fullSaveState = fullSaveState;

    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.inputManager = new GameInputManager();
  }

  public preload() {
    addLoadingScreen(this);
    this.soundManager.initialise(this, getSourceAcademyGame());
    this.layerManager.initialise(this);
    this.inputManager.initialise(this);
  }

  public create() {
    this.renderMyRoom();
  }

  private renderMyRoom() {
    const backButton = new CommonBackButton(this, () => {
      this.layerManager.clearAllLayers();
      this.scene.start('MainMenu');
    });
    this.layerManager.addToLayer(Layer.UI, backButton);
  }
}

export default Achievements;
