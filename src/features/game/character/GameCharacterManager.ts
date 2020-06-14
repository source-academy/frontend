import GameActionManager from 'src/features/game/action/GameActionManager';
import { screenSize } from '../commons/CommonConstants';
import { charRect, charWidth, CharacterPosition } from './GameCharacterConstants';
import { ItemId, SpeakerDetail } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Character } from './GameCharacterTypes';
import { GameChapter } from '../chapter/GameChapterTypes';
import { Layer } from '../layer/GameLayerTypes';
import { resize } from '../utils/SpriteUtils';

export default class CharacterManager {
  private characterContainerMap: Map<LocationId, Phaser.GameObjects.Container>;
  private characterMap: Map<ItemId, Character>;
  private characterSpriteMap: Map<ItemId, Phaser.GameObjects.Image>;
  private currentSpeakerId: ItemId | undefined;

  constructor() {
    this.characterContainerMap = new Map<LocationId, Phaser.GameObjects.Container>();
    this.characterMap = new Map<ItemId, Character>();
    this.characterSpriteMap = new Map<ItemId, Phaser.GameObjects.Image>();
  }

  public processCharacter(chapter: GameChapter) {
    this.characterMap = chapter.map.getCharacters();
    const locations = chapter.map.getLocations();

    locations.forEach(location => {
      const gameManager = GameActionManager.getInstance().getGameManager();
      const characterContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
      this.characterContainerMap.set(location.name, characterContainer);
      gameManager.add.existing(characterContainer);
    });
  }

  public renderCharacterLayerContainer(locationId: LocationId): void {
    const idsToRender =
      GameActionManager.getInstance().getLocationAttr(GameLocationAttr.characters, locationId) ||
      [];

    const characterLayer = this.renderCharactersInLoc(idsToRender, locationId);
    this.characterContainerMap.set(locationId, characterLayer);

    GameActionManager.getInstance().addContainerToLayer(Layer.Character, characterLayer);
  }

  public renderCharactersInLoc(
    idsToRender: ItemId[],
    locationName: LocationId
  ): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    this.characterContainerMap.get(locationName)!.destroy();

    const characterContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
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

    const gameManager = GameActionManager.getInstance().getGameManager();

    const characterXPosition = charRect.x[overridePosition || defaultPosition];
    const assetKey = expressions.get(overrideExpression || defaultExpression)!;

    const characterSprite = new Phaser.GameObjects.Image(
      gameManager,
      characterXPosition,
      screenSize.y,
      assetKey
    ).setOrigin(0.5, 1);

    return resize(characterSprite, charWidth);
  }

  public showCharacterOnMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      characterSprite.alpha = 1;
    }
  }

  public hideCharacterFromMap(characterId: ItemId) {
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      characterSprite.alpha = 0;
    }
  }

  public changeSpeakerTo(speakerDetail: SpeakerDetail | undefined | null) {
    if (speakerDetail === undefined) {
      return;
    }

    // delete previous speaker and restore his character on map
    if (this.currentSpeakerId) {
      this.showCharacterOnMap(this.currentSpeakerId);
    }
    const gameManager = GameActionManager.getInstance().getGameManager();
    gameManager.layerManager.clearLayerContents(Layer.Speaker);

    if (speakerDetail === null) {
      return;
    }

    // show new speaker and hide speaker's character on map
    const { speakerId, expression, speakerPosition } = speakerDetail;

    this.hideCharacterFromMap(speakerId);
    const speakerToShow = this.characterMap.get(speakerId);
    if (speakerToShow) {
      const characterSprite = this.createCharacterSprite(
        speakerToShow,
        expression,
        speakerPosition
      );
      gameManager.layerManager.addToLayer(Layer.Speaker, characterSprite);
      this.currentSpeakerId = speakerId;
    }
  }
}
