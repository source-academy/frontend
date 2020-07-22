import { mandatory } from '../utils/GameUtils';

/**
 * Manager that keeps track of all the event listeners.
 * This manager allow clearing of all listeners at once,
 * making it easier to clean up during scene transition.
 *
 * Additionally, it can also block/allow mouse and keyboard input
 * if needed.
 */
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

  public getScene = () => mandatory(this.scene);

  /**
   * Enable/disable mouse input based on the parameter.
   *
   * @param active if true, mouse input is enabled. Else, mouse input is disabled.
   */
  public enableMouseInput(active: boolean) {
    this.getScene().input.mouse.enabled = active;
  }

  /**
   * Enable/disable keyboard input based on the parameter.
   *
   * @param active if true, keyboard input is enabled. Else, keyboard input is disabled.
   */
  public enableKeyboardInput(active: boolean) {
    this.getScene().input.keyboard.enabled = active;
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
    const keyObj = this.getScene().input.keyboard.addKey(key);
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
    const eventListener = this.getScene().input.addListener(event, callback);
    this.eventListeners.concat(eventListener);
  }

  /**
   * Clear all listeners, keyboard and event listeners.
   */
  public clearListeners() {
    this.keyboardListeners.forEach(keyboardListener => keyboardListener.removeAllListeners());
    this.eventListeners.forEach(eventListener => eventListener.removeAllListeners());
  }
}

export default GameInputManager;
