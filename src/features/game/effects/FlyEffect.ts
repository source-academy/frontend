import { screenSize } from '../commons/CommonConstants';

/**
 * A tween config that makes the object fly in
 * from the top of screen into the middle of the screen
 */
export const entryTweenProps = {
  y: 0,
  duration: 300,
  ease: 'Power2'
};

/**
 * Makes the object fly out from the middle of the screen
 * to the top of the screen
 */
export const exitTweenProps = {
  y: -screenSize.y,
  duration: 250,
  ease: 'Power2'
};
