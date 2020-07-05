class GameInputManager {
  private scene: Phaser.Scene | undefined;
  private keyboardListeners: Phaser.Input.Keyboard.Key[];
  private eventListeners: Phaser.Input.InputPlugin[];

  constructor() {
    this.keyboardListeners = [];
    this.eventListeners = [];
  }

  public initialise(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public getScene() {
    if (!this.scene) {
      throw console.error('Undefined scene');
    }
    return this.scene;
  }

  public registerKeyboardListener(
    key: string | number | Phaser.Input.Keyboard.Key,
    event: string | symbol,
    callback: Function
  ) {
    const keyObj = this.getScene().input.keyboard.addKey(key);
    const keyboardListener = keyObj.addListener(event, callback);
    this.keyboardListeners.push(keyboardListener);
  }

  public registerEventListener(event: string | symbol, callback: Function) {
    const eventListener = this.getScene().input.addListener(event, callback);
    this.eventListeners.concat(eventListener);
  }

  public clearListeners() {
    this.keyboardListeners.forEach(keyboardListener => keyboardListener.removeAllListeners());
    this.eventListeners.forEach(eventListener => eventListener.removeAllListeners());
  }
}

export default GameInputManager;
