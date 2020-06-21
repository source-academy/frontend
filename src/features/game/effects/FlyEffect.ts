import { screenSize } from '../commons/CommonConstants';

export const entryTweenProps = {
  y: 0,
  duration: 500,
  ease: 'Power2'
};

export const exitTweenProps = {
  y: -screenSize.y,
  duration: 300,
  ease: 'Power2'
};
