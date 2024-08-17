import ImageAssets from '../assets/ImageAssets';
import { SpeakerDetail } from '../character/GameCharacterTypes';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { GamePosition, ItemId } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import StringUtils from '../utils/StringUtils';
import { createBitmapText } from '../utils/TextUtils';
import DialogueConstants, { speakerTextStyle } from './GameDialogueConstants';

/**
 * Class that manages speakerbox portion of the dialgoue box
 * And renders the characters in Speaker Layer
 *
 */
export default class DialogueSpeakerRenderer {
  private currentSpeakerId?: string;
  private speakerSprite?: Phaser.GameObjects.Image;
  private speakerSpriteBox?: Phaser.GameObjects.Container;

  /**
   * Changes the speaker shown in the speaker box and the speaker rendered on screen
   *
   * @param newSpeakerDetail the details about the new speaker,
   * including his characaterId, expression and position.
   *
   * Undefined - if no speaker changes are involved in the dialogue line.
   * Null - if there is no speaker for the line
   */
  public changeSpeakerTo(newSpeakerDetail?: SpeakerDetail | null) {
    if (newSpeakerDetail === undefined) return;

    if (this.currentSpeakerId) {
      GameGlobalAPI.getInstance().clearSeveralLayers([Layer.Speaker, Layer.SpeakerBox]);
    }
    this.showNewSpeaker(newSpeakerDetail);
  }

  private showNewSpeaker(newSpeakerDetail: SpeakerDetail | null) {
    if (newSpeakerDetail) {
      this.drawSpeakerSprite(newSpeakerDetail);
      this.drawSpeakerBox(newSpeakerDetail.speakerId);
    }
  }

  private drawSpeakerBox(speakerId: ItemId) {
    if (speakerId === 'narrator') return;
    const speakerContainer =
      speakerId === 'you'
        ? this.createSpeakerBox(this.getUsername(), GamePosition.Right)
        : this.createSpeakerBox(
            GameGlobalAPI.getInstance().getCharacterById(speakerId).name,
            GamePosition.Left
          );
    GameGlobalAPI.getInstance().addToLayer(Layer.SpeakerBox, speakerContainer);
  }

  private drawSpeakerSprite({ speakerId, speakerPosition, expression }: SpeakerDetail) {
    this.currentSpeakerId = speakerId;
    if (speakerId === 'you' || speakerId === 'narrator') {
      return;
    }
    const speakerSprite = GameGlobalAPI.getInstance().createCharacterSprite(
      speakerId,
      expression,
      speakerPosition
    );
    this.speakerSprite = speakerSprite;
    GameGlobalAPI.getInstance().addToLayer(Layer.Speaker, speakerSprite);
  }

  private createSpeakerBox(text: string, position: GamePosition) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);
    const rectangle = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.speakerBox.key
    ).setAlpha(0.8);

    const speakerText = createBitmapText(
      gameManager,
      '',
      DialogueConstants.speakerTextConfig,
      speakerTextStyle
    );

    if (position === GamePosition.Right) {
      rectangle.displayWidth *= -1;
      speakerText.x = screenSize.x - speakerText.x;
    }

    container.add([rectangle, speakerText]);
    speakerText.text = StringUtils.capitalize(text);
    this.speakerSpriteBox = container;
    return container;
  }

  /**
   * Hide the speaker box and sprite
   */
  public async hide() {
    this.getSpeakerSprite().setVisible(false);
    this.getSpeakerSpriteBox().setVisible(false);
  }

  /**
   * Show the hidden speaker box and sprite
   */
  public async show() {
    this.getSpeakerSprite().setVisible(true);
    this.getSpeakerSpriteBox().setVisible(true);
  }

  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
  private getSpeakerSprite = () => this.speakerSprite as Phaser.GameObjects.Image;
  private getSpeakerSpriteBox = () => this.speakerSpriteBox as Phaser.GameObjects.Container;
}
