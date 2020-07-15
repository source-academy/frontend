import ImageAssets from '../assets/ImageAssets';
import { SpeakerDetail } from '../character/GameCharacterTypes';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { GamePosition, ItemId } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import StringUtils from '../utils/StringUtils';
import { createBitmapText } from '../utils/TextUtils';
import DialogueConstants, { speakerTextStyle } from './GameDialogueConstants';

/**
 * Class that manages speakerbox portion of the dialgoue box
 * Rendering it in the right place and placing the right name
 *
 * This class also signals the character manager to render speaker sprites in front
 * And hide them from the map if they are the ones speaking
 */
export default class DialogueSpeakerRenderer {
  private currentSpeakerId?: string;
  private username: string;

  constructor(username: string) {
    this.username = username;
  }

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

    this.hidePreviousSpeaker(this.currentSpeakerId);
    this.showNewSpeaker(newSpeakerDetail);
  }

  private hidePreviousSpeaker(previousSpeakerId?: ItemId) {
    if (previousSpeakerId) {
      GameGlobalAPI.getInstance().clearSeveralLayers([Layer.Speaker, Layer.DialogueLabel]);
      GameGlobalAPI.getInstance().showCharacterOnMap(previousSpeakerId);
    }
  }

  private showNewSpeaker(newSpeakerDetail: SpeakerDetail | null) {
    if (newSpeakerDetail) {
      this.drawSpeakerSprite(newSpeakerDetail);
      this.drawSpeakerBox(newSpeakerDetail.speakerId);
    }
  }

  private drawSpeakerBox(speakerId: ItemId) {
    const speakerContainer =
      speakerId === 'you'
        ? this.createSpeakerBox(this.username, GamePosition.Right)
        : this.createSpeakerBox(
            GameGlobalAPI.getInstance().getCharacterById(speakerId).name,
            GamePosition.Left
          );
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.DialogueLabel, speakerContainer);
  }

  private drawSpeakerSprite({ speakerId, speakerPosition, expression }: SpeakerDetail) {
    if (speakerId === 'you' || speakerId === 'narrator') {
      return;
    }
    GameGlobalAPI.getInstance().hideCharacterFromMap(speakerId);
    const speakerSprite = GameGlobalAPI.getInstance().createCharacterSprite(
      speakerId,
      expression,
      speakerPosition
    );
    GameGlobalAPI.getInstance().addContainerToLayer(Layer.Speaker, speakerSprite);
    this.currentSpeakerId = speakerId;
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
      DialogueConstants.speakerRect.x,
      DialogueConstants.speakerRect.y,
      speakerTextStyle
    ).setOrigin(0.5, 0.5);

    if (position === GamePosition.Right) {
      rectangle.displayWidth *= -1;
      speakerText.x = screenSize.x - speakerText.x;
    }

    container.add([rectangle, speakerText]);
    speakerText.text = StringUtils.capitalize(text);
    return container;
  }
}
