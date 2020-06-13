import GameActionManager from 'src/features/game/action/GameActionManager';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';
import { Constants } from '../commons/CommonConstants';
import { SpeakerDetail } from '../dialogue/DialogueTypes';
import { charRect } from './CharacterConstants';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import { avatarKey } from 'src/features/game/character/CharacterHelper';

export default class CharacterManager {
  private currentAvatar: Phaser.GameObjects.Image | undefined;
  private container: Phaser.GameObjects.Container;
  private gameManager: GameManager;

  constructor() {
    this.gameManager = GameActionManager.getInstance().getGameManager();
    this.container = new Phaser.GameObjects.Container(this.gameManager, 0, 0, []);
  }

  public changeCharacter(speakerDetail: SpeakerDetail) {
    if (!speakerDetail || !this.currentAvatar) {
      return;
    }
    fadeAndDestroy(this.gameManager, this.currentAvatar);

    const [speaker, expression] = speakerDetail;
    if (speaker === 'narrator') {
      return null;
    }
    const avatar = new Phaser.GameObjects.Image(
      this.gameManager,
      charRect.x.left,
      charRect.y,
      avatarKey(speaker, expression)
    )
      .setAlpha(0)
      .setOrigin(0.5, 1)
      .setDisplaySize(0, charRect.height);

    this.container.add([avatar]);
    this.gameManager.add.tween(fadeIn([avatar], Constants.fadeDuration));
    return avatar;
  }
}
