import { screenCenter } from '../../commons/CommonConstants';
import { Color } from '../../utils/StyleUtils';

export const AwardsHallConstants = {
  defaultScrollSpeed: 20,
  itemPerCol: 4,
  tileDim: 2048,
  maxAwardsPerCol: 4,
  awardsXSpacing: 300,
  arrowXOffset: 875,
  awardYStartPos: 300,
  awardYSpace: screenCenter.y - 40,
  awardDim: 200,
  hoverWidth: 300
};

export const awardHoverTitleStyle = {
  fontFamily: 'Verdana',
  fontSize: '20px',
  fill: Color.lightBlue,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.hoverWidth - 20 }
};

export const awardHoverKeyStyle = {
  fontFamily: 'Verdana',
  fontSize: '15px',
  fill: Color.offWhite,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.hoverWidth - 20 }
};

export const awardHoverDescStyle = {
  fontFamily: 'Verdana',
  fontSize: '15px',
  fill: Color.lightBlue,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.hoverWidth - 20 }
};
