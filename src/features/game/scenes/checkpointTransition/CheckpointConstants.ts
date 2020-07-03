import { Color } from '../../utils/StyleUtils';

export const chapterTransitionText = 'Chapter completed';
export const checkpointTransitionText = 'Checkpoint reached';

export const transitionTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: Color.lightBlue,
  align: 'center'
};

export const transitionDuration = 2000;

export const transitionEntryTween = {
  alpha: 1,
  duration: transitionDuration,
  ease: 'Power2'
};

export const transitionExitTween = {
  alpha: 0,
  duration: transitionDuration,
  ease: 'Power2'
};
