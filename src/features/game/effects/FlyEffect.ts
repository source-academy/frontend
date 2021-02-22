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

/**
 * A tween config that makes the object fly in
 * from the left of screen into the middle of the screen
 */
export const leftSideEntryTweenProps = {
  x: 0,
  duration: 350,
  ease: 'Power2'
};

/**
 * Makes the object fly out from the middle of the screen
 * to the left of the screen
 */
export const leftSideExitTweenProps = {
  x: -screenSize.x,
  duration: 350,
  ease: 'Power2'
};

/**
 * A tween config that makes the object fly in
 * from the right of screen into the middle of the screen
 */
export const rightSideEntryTweenProps = {
  x: 0,
  duration: 500,
  ease: 'Power2'
};

/**
 * Makes the object fly out from the middle of the screen
 * to the right of the screen
 */
export const rightSideExitTweenProps = {
  x: screenSize.x,
  duration: 500,
  ease: 'Power2'
};
