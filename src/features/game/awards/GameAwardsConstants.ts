import FontAssets from '../assets/FontAssets';
import { Constants, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { Color } from '../utils/StyleUtils';
import { AwardProperty } from './GameAwardsTypes';

export const listBannerTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const awardTitleStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 50,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const awardKeyStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 18,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const awardDescStyle = {
  fontFamily: 'Verdana',
  fontSize: '18px',
  fill: Color.lightBlue,
  align: 'center',
  lineSpacing: 10,
  wordWrap: { width: 500 }
};

export const defaultAwardProp: AwardProperty = {
  id: 'default-award',
  assetKey: Constants.nullInteractionId,
  assetPath: Constants.nullInteractionId,
  title: Constants.nullInteractionId,
  description: 'There is no asset associated with this award.',
  completed: false
};

export const awardExplanation =
  "Asset key can be used to include the asset into your room by using 'create_award' function.";

const previewXPos = -screenSize.x * 0.3;
const previewYPos = -screenSize.y * 0.05;
const previewKeyYPos = previewYPos + 275;
const previewDim = 430;

const AwardsConstants = {
  arrow: { x: screenSize.x * 0.08, y: screenSize.y * 0.34, xOffset: 80, xScale: 0.4, yScale: 0.3 },
  itemsPerPage: 7,
  list: { yStart: -screenSize.y * 0.31, ySpace: 100 },
  listTextConfig: { x: -screenSize.x * 0.09, y: 0, oriX: 0.0, oriY: 0.55 },
  noPreviewTextConfig: { x: previewXPos, y: -40, oriX: 0.5, oriY: 0.5 },
  preview: {
    descText: { yOffset: 320 },
    rect: { dim: previewDim, x: previewXPos, y: previewYPos, xOffset: 30, yOffset: 15 },
    key: { x: previewXPos, y: previewKeyYPos, width: previewDim, height: 35 },
    keyTagTextConfig: { x: previewXPos - 205, y: previewKeyYPos, oriX: 0.0, oriY: 0.5 },
    keyTextConfig: { x: previewXPos - 90, y: previewKeyYPos, oriX: 0.0, oriY: 0.5 },
    explanation: { x: previewXPos - 150, y: previewYPos + 200 },
    titleTextConfig: { x: previewXPos + 20, y: previewYPos - 275, oriX: 0.5, oriY: 0.5 }
  }
};

export default AwardsConstants;
