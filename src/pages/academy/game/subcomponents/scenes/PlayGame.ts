import { Constants as c, Keys as k } from '../utils/constants';
import { addButton } from '../utils/styles';
import { createDialogue } from '../dialogue/DialogueRenderer';
import { parseDialogue } from '../dialogue/DialogueManager';
import { preloadDialogue, loadDialogueAssets } from '../dialogue/DialoguePreloader';
import { preloadObjects, loadObjectsAssets } from '../objects/ObjectsPreloader';
import { resize } from '../utils/spriteUtils';
import { parseObjects } from '../objects/ObjectsManager';
import { createObjectsLayer } from '../objects/ObjectsRenderer';

class PlayGame extends Phaser.Scene {
  constructor() {
    super('PlayGame');
  }

  public init() {}

  public preload() {
    preloadDialogue(this, '../assets/dialogue.txt');
    preloadObjects(this, '../assets/objects.txt');

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
    const dialogueText = this.cache.text.get('#D../assets/dialogue.txt');
    const [activateDialogueLayer] = createDialogue(this, parseDialogue(dialogueText));
    activateDialogueLayer();

    const objectText = this.cache.text.get('#O../assets/objects.txt');
    const objectPropertyMap = parseObjects(objectText)['room'];
    const [, container] = createObjectsLayer(this, objectPropertyMap);
    this.add.existing(container);
  }

  private addAssetToScene() {
    const selectedAsset = sessionStorage.getItem(k.selectedAsset) || '';
    this.load.image('$' + selectedAsset, c.assetsFolder + selectedAsset);
  }

  public handleLoadComplete(key: string) {
    switch (key[0]) {
      case '$':
        const imageSprite = this.add
          .image(c.centerX, c.centerY, key)
          .setInteractive({ pixelPerfect: true, useHandCursor: true });
        resize(imageSprite, c.screenWidth / 4);
        break;
      case '#':
        switch (key[1]) {
          case 'D':
            console.log(key);
            loadDialogueAssets(this, key);
            break;
          case 'O':
            loadObjectsAssets(this, key);
            break;
        }
        break;
      default:
        break;
    }
  }
}

export default PlayGame;
