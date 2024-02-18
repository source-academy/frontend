/**
 * Manager that keeps track of all the event listeners.
 * This manager allow clearing of all listeners at once,
 * making it easier to clean up during scene transition.
 *
 * Additionally, it can also block/allow mouse and keyboard input
 * if needed.
 */
class GameInputManager {
  private scene: Phaser.Scene;
  private keyboardListeners: Phaser.Input.Keyboard.Key[];
  private eventListeners: Phaser.Input.InputPlugin[];

  constructor(scene: Phaser.Scene) {
    this.keyboardListeners = [];
    this.eventListeners = [];
    this.scene = scene;
  }

  /**
   * Set default cursor icon.
   *
   * @param cursor css cursor value
   */
  public setDefaultCursor(cursor: string) {
    this.scene.input.setDefaultCursor(cursor);
  }

  /**
   * Enable/disable mouse input based on the parameter.
   *
   * @param active if true, mouse input is enabled. Else, mouse input is disabled.
   */
  public enableMouseInput(active: boolean) {
    this.scene.input.mouse.enabled = active;
  }

  /**
   * Enable/disable keyboard input based on the parameter.
   *
   * @param active if true, keyboard input is enabled. Else, keyboard input is disabled.
   */
  public enableKeyboardInput(active: boolean) {
    this.scene.input.keyboard.enabled = active;
  }

  /**
   * Register a keyboard listener into the input manager.
   * The manager will keep track of this listener.
   *
   * @param key keyboard key the listener is attached to
   * @param event event to be listened to
   * @param callback callback to execute on event
   */
  public registerKeyboardListener(
    key: string | number | Phaser.Input.Keyboard.Key,
    event: string | symbol,
    callback: Function
  ) {
    const keyObj = this.scene.input.keyboard.addKey(key);
    const keyboardListener = keyObj.addListener(event, callback);
    this.keyboardListeners.push(keyboardListener);
  }

  /**
   * Register an event listener into the input manager.
   * The manager will keep track of this listener.
   *
   * @param event event to be listened to
   * @param callback callback to execute on event
   */
  public registerEventListener(event: string | symbol, callback: Function) {
    const eventListener = this.scene.input.addListener(event, callback);
    this.eventListeners.concat(eventListener);
  }

  /**
   * Clear all listeners, keyboard and event listeners.
   */
  public clearListeners() {
    this.keyboardListeners.forEach(keyboardListener => keyboardListener.removeAllListeners());
    this.eventListeners.forEach(eventListener => eventListener.removeAllListeners());
  }

  /**
   * Clear specific keyboard listeners.
   */
  public clearKeyboardListeners(keycodes: number[]) {
    this.keyboardListeners.forEach(keyboardListener => {
      if (keycodes.includes(keyboardListener.keyCode)) {
        keyboardListener.removeAllListeners();
      }
    });
  }
}

export default GameInputManager;
