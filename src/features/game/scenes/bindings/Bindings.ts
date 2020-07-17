import ImageAssets from '../../assets/ImageAssets';
import CommonBackButton from '../../commons/CommonBackButton';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { calcListFormatPos } from '../../utils/StyleUtils';
import { createBitmapText } from '../../utils/TextUtils';
import { bindingConstants, keyDescStyle, keyStyle } from './BindingsConstants';

class Bindings extends Phaser.Scene {
  public layerManager: GameLayerManager;
  public inputManager: GameInputManager;

  constructor() {
    super('Bindings');
    this.layerManager = new GameLayerManager();
    this.inputManager = new GameInputManager();
  }

  public preload() {
    this.layerManager.initialise(this);
    this.inputManager.initialise(this);
  }

  public create() {
    this.renderBackground();
    this.renderBindings();
  }

  private renderBackground() {
    const background = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.settingBackground.key
    );
    const blackOverlay = new Phaser.GameObjects.Rectangle(
      this,
      screenCenter.x,
      screenCenter.y,
      screenSize.x,
      screenSize.y,
      0
    ).setAlpha(0.3);
    this.layerManager.addToLayer(Layer.Background, background);
    this.layerManager.addToLayer(Layer.Background, blackOverlay);
  }

  private renderBindings() {
    const bindingsContainer = new Phaser.GameObjects.Container(this, 0, 0);

    const bindings = this.getBindings();
    const bindingPositions = calcListFormatPos({
      numOfItems: bindings.length,
      xSpacing: 0,
      ySpacing: bindingConstants.keyYSpacing
    });

    bindingsContainer.add(
      bindings.map((binding, index) =>
        this.createBinding(
          binding.key,
          binding.text,
          bindingPositions[index][0],
          bindingPositions[index][1] + bindingConstants.keyStartYPos
        )
      )
    );
    const backButton = new CommonBackButton(this, () => {
      this.layerManager.clearAllLayers();
      this.scene.start('MainMenu');
    });

    this.layerManager.addToLayer(Layer.UI, bindingsContainer);
    this.layerManager.addToLayer(Layer.UI, backButton);
  }

  private getBindings() {
    return [
      {
        key: 'Esc',
        text: 'Escape Menu'
      },
      {
        key: 'Tab',
        text: 'Awards Menu'
      }
    ];
  }

  private createBinding(key: string, desc: string, xPos: number, yPos: number) {
    const bindingContainer = new Phaser.GameObjects.Container(this, xPos, yPos);

    // Different keys may use different key icon
    const keyIcon = new Phaser.GameObjects.Sprite(
      this,
      bindingConstants.keyIconXPos,
      0,
      ImageAssets.squareKeyboardIcon.key
    );
    switch (key) {
      case 'Tab':
        keyIcon.setTexture(ImageAssets.medKeyboardIcon.key);
        break;
      default:
        break;
    }

    const keyText = createBitmapText(
      this,
      key,
      bindingConstants.keyIconXPos,
      0,
      keyStyle
    ).setOrigin(0.5, 0.5);
    const keyDesc = createBitmapText(
      this,
      desc,
      bindingConstants.keyDescXPos,
      0,
      keyDescStyle
    ).setOrigin(0.5, 0.5);

    bindingContainer.add([keyIcon, keyText, keyDesc]);
    return bindingContainer;
  }
}

export default Bindings;
