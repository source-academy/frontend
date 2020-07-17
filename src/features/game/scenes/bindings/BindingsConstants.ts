import { screenCenter } from "../../commons/CommonConstants";
import { BitmapFontStyle } from "../../commons/CommonTypes";
import FontAssets from "../../assets/FontAssets";
import { HexColor } from "../../utils/StyleUtils";

export const bindingConstants = {
    keyIconXPos: screenCenter.x - 300, 
    keyDescXPos: screenCenter.x + 300
}

export const keyStyle: BitmapFontStyle = {
    key: FontAssets.zektonFont.key,
    size: 30,
    fill: HexColor.lightBlue,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
}

export const keyDescStyle: BitmapFontStyle = {
    key: FontAssets.zektonFont.key,
    size: 25,
    fill: HexColor.lightBlue,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
}