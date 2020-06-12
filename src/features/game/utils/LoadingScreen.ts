import { screenCenter } from '../commons/CommonConstants';

const barWidth = 320;
const barHeight = 50;
const padding = 10;

const innerWidth = barWidth - padding * 2;
const innerHeight = barHeight - padding * 2;
const barX = screenCenter.x - barWidth / 2;
const barY = screenCenter.y;
const innerBarX = barX + padding;
const innerBarY = barY + padding;

export function addLoadingScreen(scene: Phaser.Scene) {
  const progressBar = scene.add.graphics();
  const progressBox = scene.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(barX, barY, barWidth, barHeight);

  scene.load.on('progress', (value: number) => {
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(innerBarX, innerBarY, innerWidth * value, innerHeight);
  });

  scene.load.on('complete', function () {
    progressBar.destroy();
    progressBox.destroy();
  });
}
