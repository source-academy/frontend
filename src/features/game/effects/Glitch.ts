import FontAssets from '../assets/FontAssets';
import { BitmapFontStyle, ILayeredScene, TextConfig } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import { createBitmapText } from '../utils/TextUtils';

const defaultGlitchStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export function addGlitchText(
  scene: ILayeredScene,
  text: string,
  baseTextConfig: TextConfig = { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
  style: BitmapFontStyle = defaultGlitchStyle,
  numOfFrames: number = 4,
  maxXDisplacement: number = 5,
  maxYDisplacement: number = 3
) {
  const textFrames = [];
  for (let i = 0; i < numOfFrames; i++) {
    const textConfig = {
      x: baseTextConfig.x + maxXDisplacement * Math.random(),
      y: baseTextConfig.y + maxYDisplacement * Math.random(),
      oriX: baseTextConfig.oriX,
      oriY: baseTextConfig.oriY
    };
    const bitmapText = createBitmapText(scene, text, textConfig, style);
    bitmapText.setAlpha(0.4).setBlendMode(Phaser.BlendModes.SCREEN);
    textFrames.push(bitmapText);
  }

  textFrames.forEach(bitmapText => {
    scene.getLayerManager().addToLayer(Layer.Effects, bitmapText);
    scene.tweens.add({
      targets: bitmapText,
      x: bitmapText.x + maxXDisplacement * Math.random(),
      y: bitmapText.y + maxYDisplacement * Math.random(),
      alpha: 0.5,
      duration: 20,
      yoyo: true,
      loop: -1,
      loopDelay: 1000 * Math.random()
    });
  });

  return textFrames;
}
