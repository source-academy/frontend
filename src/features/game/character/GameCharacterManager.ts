import GameActionManager from 'src/features/game/action/GameActionManager';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';
import { Constants } from '../commons/CommonConstants';
import { SpeakerDetail } from '../dialogue/DialogueTypes';
import { charRect } from './CharacterConstants';
import { avatarKey } from 'src/features/game/character/CharacterHelper';

export default class CharacterManager {
  private currentAvatar: Phaser.GameObjects.Image | undefined;
  private container: Phaser.GameObjects.Container | undefined;

  constructor() {
    this.container = undefined;
  }

  public changeCharacter(speakerDetail: SpeakerDetail) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!this.container) {
      this.container = new Phaser.GameObjects.Container(gameManager, 0, 0);
    }
    if (!speakerDetail || !this.currentAvatar) {
      return;
    }
    fadeAndDestroy(gameManager, this.currentAvatar);

    const [speaker, expression] = speakerDetail;
    if (speaker === 'narrator') {
      return null;
    }
    const avatar = new Phaser.GameObjects.Image(
      gameManager,
      charRect.x.left,
      charRect.y,
      avatarKey(speaker, expression)
    )
      .setAlpha(0)
      .setOrigin(0.5, 1)
      .setDisplaySize(0, charRect.height);

    this.container.add([avatar]);
    gameManager.add.tween(fadeIn([avatar], Constants.fadeDuration));
    return avatar;
  }
}
