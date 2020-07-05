import GameManager from '../scenes/gameManager/GameManager';
import StringUtils from '../utils/StringUtils';

import { screenSize, screenCenter } from '../commons/CommonConstants';
import { charRect, charWidth, speakerRect, speakerTextStyle } from './GameCharacterConstants';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Character, SpeakerDetail, CharacterPosition } from './GameCharacterTypes';
import { Layer } from '../layer/GameLayerTypes';
import { resize } from '../utils/SpriteUtils';
import { speakerBox } from '../commons/CommonAssets';
import { fadeIn, fadeOut } from '../effects/FadeEffect';

export default class CharacterManager {
  private characterMap: Map<ItemId, Character>;
  private characterSpriteMap: Map<ItemId, Phaser.GameObjects.Image>;
  private username: string | undefined;
  private gameManager: GameManager;

  private currentSpeakerId: ItemId | undefined;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.characterSpriteMap = new Map<ItemId, Phaser.GameObjects.Image>();
    this.characterMap = gameManager.currentCheckpoint.map.getCharacters();
    this.username = gameManager.getAccountInfo().name;
  }

  public renderCharacterLayerContainer(locationId: LocationId): void {
    const idsToRender =
      this.gameManager.getStateManager().getLocationAttr(GameLocationAttr.characters, locationId) ||
      [];

    const characterLayer = this.renderCharactersInLoc(idsToRender);
    this.gameManager.getLayerManager().addToLayer(Layer.Character, characterLayer);
  }

  public renderCharactersInLoc(idsToRender: ItemId[]): Phaser.GameObjects.Container {
    const characterContainer = new Phaser.GameObjects.Container(this.gameManager, 0, 0);
    idsToRender.forEach(id => {
      const characterToRender = this.characterMap.get(id);
      if (characterToRender) {
        const characterSprite = this.createCharacterSprite(characterToRender);
        characterContainer.add(characterSprite);
        this.characterSpriteMap.set(id, characterSprite);
      }
    });

    return characterContainer;
  }

  private createCharacterSprite(
    character: Character,
    overrideExpression?: string,
    overridePosition?: CharacterPosition
  ) {
    const { defaultPosition, defaultExpression, expressions } = character;

    const characterXPosition = charRect.x[overridePosition || defaultPosition];
    const assetKey = expressions.get(overrideExpression || defaultExpression)!;

    const characterSprite = new Phaser.GameObjects.Image(
      this.gameManager,
      characterXPosition,
      screenSize.y,
      assetKey
    ).setOrigin(0.5, 1);

    resize(characterSprite, charWidth);
    return characterSprite;
  }

  public showCharacterOnMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      this.gameManager.add.tween(fadeIn([characterSprite]));
    }
  }

  public hideCharacterFromMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      this.gameManager.add.tween(fadeOut([characterSprite]));
    }
  }

  private drawSpeakerBox(text: string, positionRight = false) {
    const container = new Phaser.GameObjects.Container(this.gameManager, 0, 0);
    const rectangle = new Phaser.GameObjects.Image(
      this.gameManager,
      screenCenter.x,
      screenCenter.y,
      speakerBox.key
    ).setAlpha(0.8);

    const speakerText = new Phaser.GameObjects.Text(
      this.gameManager,
      speakerRect.x,
      speakerRect.y,
      '',
      speakerTextStyle
    ).setOrigin(0.5);

    if (positionRight) {
      rectangle.displayWidth *= -1;
      speakerText.x = screenSize.x - speakerText.x;
    }

    container.add([rectangle, speakerText]);
    speakerText.text = StringUtils.capitalize(text);

    this.gameManager.getLayerManager().addToLayer(Layer.DialogueLabel, container);
  }

  public changeSpeakerTo(speakerDetail: SpeakerDetail | undefined | null) {
    if (speakerDetail === undefined) {
      return;
    }

    // delete previous speaker and restore his character on map
    if (this.currentSpeakerId) {
      this.showCharacterOnMap(this.currentSpeakerId);
    }
    this.gameManager.getLayerManager().clearLayerContents(Layer.Speaker);
    this.gameManager.getLayerManager().clearLayerContents(Layer.DialogueLabel);

    if (speakerDetail === null) {
      return;
    }

    // show new speaker and hide speaker's character on map
    const { speakerId, expression, speakerPosition } = speakerDetail;
    if (speakerId === 'you') {
      this.drawSpeakerBox(this.username!, true);
    }

    this.hideCharacterFromMap(speakerId);
    const speakerToShow = this.characterMap.get(speakerId);
    if (speakerToShow) {
      const characterSprite = this.createCharacterSprite(
        speakerToShow,
        expression,
        speakerPosition
      );
      this.gameManager.getLayerManager().addToLayer(Layer.Speaker, characterSprite);
      this.drawSpeakerBox(speakerToShow.name);
      this.currentSpeakerId = speakerId;
    }
  }
}
