import * as Phaser from 'phaser';

class PhaserImage extends Phaser.GameObjects.Image {
  resize(width: number, height: number) {
    this.displayWidth = width;
    this.displayHeight = height || width;
    return this;
  }

  multSize(factor: number) {
    this.displayWidth *= factor;
    this.displayHeight *= factor;
    return this;
  }
}

class PhaserContainer extends Phaser.GameObjects.Container {
  resize(width: number, height: number) {
    this.list.map(child => (child as any).setSize(width, height));
    this.setSize(width, height || width);
    return this;
  }

  setObjState(initialState: object) {
    this.setDataEnabled();
    Object.keys(initialState).map(key => this.data.set(key, initialState[key]));
    return this;
  }

  getObjState() {
    return this.data.list;
  }
}

export class PhaserScene extends Phaser.Scene {
  gameFunc: any;
  constructor(config: any & { func: any }) {
    super(config);
    this.gameFunc = config.func;
  }
  addImage(x: number, y: number, texture: string, frame?: string | number | undefined) {
    const image = new PhaserImage(this, x, y, texture, frame);
    this.add.existing(image);
    return image;
  }

  addContainer(x: number, y: number, children?: Phaser.GameObjects.GameObject[] | undefined) {
    const container = new PhaserContainer(this, x, y, children);
    this.add.existing(container);
    return container;
  }
}

export class PhaserGame extends Phaser.Game {
  sceneAdd(
    func: any,
    key: string,
    sceneConfig:
      | Function
      | Phaser.Scene
      | Phaser.Types.Scenes.SettingsConfig
      | Phaser.Types.Scenes.CreateSceneFromObjectConfig,
    autoStart?: boolean | undefined,
    data?: object | undefined
  ) {
    this.scene.add(key, sceneConfig, autoStart, { ...data, func });
  }
}
