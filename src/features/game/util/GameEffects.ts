import { sleep } from './GameUtils';
import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import { blackScreen } from '../commons/CommonsTypes';

export const blackFade = async (
  gameManager: GameManager,
  fadeDuration: number,
  delay: number,
  callback: any
) => {
  const fadeBlack = gameManager.add.image(blackScreen.xPos, blackScreen.yPos, blackScreen.key);

  // Fade in
  fadeBlack.setAlpha(0);
  gameManager.tweens.add({
    targets: fadeBlack,
    alpha: 1,
    duration: fadeDuration,
    ease: 'Power2'
  });
  await sleep(fadeDuration);

  callback();
  await sleep(delay);

  // Fade out
  fadeBlack.setAlpha(1);
  gameManager.tweens.add({
    targets: fadeBlack,
    alpha: 0,
    duration: fadeDuration,
    ease: 'Power2'
  });
  await sleep(fadeDuration);

  fadeBlack.destroy();
};

const effectAssets = [blackScreen];

export default effectAssets;
