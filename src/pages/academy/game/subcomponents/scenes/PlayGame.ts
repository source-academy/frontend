import { Constants as c, Keys as k } from '../utils/constants';
import { addButton } from '../utils/styles';
import { createDialogue } from '../dialogue/DialogueRenderer';
import { parseDialogue } from '../dialogue/DialogueManager';
import { preloadDialogue } from '../dialogue/DialoguePreloader';
import { resize } from '../utils/spriteUtils';

class PlayGame extends Phaser.Scene {
  constructor() {
    super('PlayGame');
  }

  public init() {}

  public preload() {
    preloadDialogue(this, '../assets/dialogue.txt');
    this.load.image('bg', c.assetsFolder + '/locations/yourRoom-dim/normal.png');
    this.load.on('filecomplete', (key: string) => this.handleLoadComplete(key));
  }

  public create() {
    this.addElementsToScene();
  }

  private addElementsToScene() {
    const background = this.add.image(c.centerX, c.centerY, 'bg');
    resize(background, c.screenWidth, c.screenHeight);

    addButton(this, 'Add avatar', () => this.addAssetToScene(), {
      x: c.screenWidth * 0.5,
      y: c.screenHeight * 0.9
    });

    const dialogueText = this.cache.text.get('dialogueText');
    const [activateContainer] = createDialogue(this, parseDialogue(dialogueText));

    activateContainer();
  }

  private addAssetToScene() {
    const selectedAsset = sessionStorage.getItem(k.selectedAsset) || '';
    this.load.image('$' + selectedAsset, c.assetsFolder + selectedAsset);
    this.load.start();
  }

  private handleLoadComplete(key: string) {
    switch (true) {
      case key[0] === '$':
        const imageSprite = this.add
          .image(c.centerX, c.centerY, key)
          .setInteractive({ pixelPerfect: true, useHandCursor: true });
        resize(imageSprite, c.screenWidth / 4);
        break;
    }
  }
}

export default PlayGame;
