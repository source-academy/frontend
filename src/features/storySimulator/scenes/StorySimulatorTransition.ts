import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { studentRoomImg } from 'src/features/game/location/GameMapConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import Parser from 'src/features/game/parser/Parser';
import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';

class StorySimulatorTransition extends Phaser.Scene {
  private layerManager: GameLayerManager;
  constructor() {
    super('StorySimulatorTransition');
    this.layerManager = new GameLayerManager();
  }

  public async preload() {
    this.renderBackground();
    const text = sessionStorage.getItem('checkpointTxt');
    if (text) {
      const gameCheckpoint = Parser.parse(text);

      console.log(getStorySimulatorGame().scene);

      this.scene.start('GameManager', {
        isStorySimulator: true,
        fullSaveState: undefined,
        gameCheckpoint,
        continueGame: false,
        chapterNum: -1,
        checkpointNum: -1
      });
    }
  }

  public renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      studentRoomImg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);
    this.add.existing(backgroundImg);

    this.layerManager.addToLayer(Layer.Background, backgroundImg);
  }
}

export default StorySimulatorTransition;
