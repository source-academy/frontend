/**
 * A GameObject that contains a simple input text box, with a 'submit' button.
 * The same pattern can be used to create and position other HTML Elements over the Game Canvas.
 */
class InputGameElement extends Phaser.GameObjects.Container {
  private container: Phaser.GameObjects.Container;

  //fields and properties for the input text box
  private inputTextBoxX: number;
  private inputTextBoxY: number;
  private inputTextBoxBgColor: string;
  private inputTextBoxSizeX: number;
  private inputTextBoxSizeY: number;
  private inputTextBoxFontSize: number;
  private inputTextBoxFontFace: string;
  private inputTextBoxPlaceholder: string;

  //fields and properties for the submit button
  private buttonX: number;
  private buttonY: number;
  private buttonBgColor: string;
  private buttonSizeX: number;
  private buttonSizeY: number;
  private buttonFontSize: number;
  private buttonFontFace: string;

  /**
   * Constructor for the Game Object, which takes in several default arguments.
   * @param scene: The scene the dom element is added to. Should be minimally created using new InputGameElement(this), where this is the current scene.
   * @param x
   * @param y
   * @param inputTextBoxX
   * @param inputTextBoxY
   * @param inputTextBoxBgColor
   * @param inputTextBoxSizeX
   * @param inputTextBoxSizeY
   * @param inputTextBoxFontSize
   * @param inputTextBoxFontFace
   * @param inputTextBoxPlaceholder
   * @param buttonX
   * @param buttonY
   * @param buttonBgColor
   * @param buttonSizeX
   * @param buttonSizeY
   * @param buttonFontSize
   * @param buttonFontFace
   *
   * @return an input box game object with the following properties.
   * creates inputTextBox and submitButton using the specified (or default) properties. the following code can be adapted to produce other HTML Dom Elements as Game Objects
   * Needs better way to handle positioning, currently uses parent canvas and absolute positioning
   * Improvements: 1. pipeline to actually return a value to the engine/parser, 2. more abstraction while handling positioning of the gameObject
   * new InputGameElement(this,0,0,); Add this line to the Settings.ts or any other scene file's public async create() method for scene to see the GameObject positioned on top of Game Canvas.
   */
  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    inputTextBoxX = 400,
    inputTextBoxY = 100,
    inputTextBoxBgColor = 'white',
    inputTextBoxSizeX = 320,
    inputTextBoxSizeY = 100,
    inputTextBoxFontSize = 48,
    inputTextBoxFontFace = 'Arial',
    inputTextBoxPlaceholder = 'Enter Name',
    buttonX = 400,
    buttonY = 200,
    buttonBgColor = 'green',
    buttonSizeX = 220,
    buttonSizeY = 100,
    buttonFontSize = 48,
    buttonFontFace = 'Arial'
  ) {
    super(scene, x, y);
    this.inputTextBoxX = inputTextBoxX + x;
    this.inputTextBoxY = inputTextBoxY + y;
    this.inputTextBoxBgColor = inputTextBoxBgColor;
    this.inputTextBoxSizeX = inputTextBoxSizeX;
    this.inputTextBoxSizeY = inputTextBoxSizeY;
    this.inputTextBoxFontSize = inputTextBoxFontSize;
    this.inputTextBoxFontFace = inputTextBoxFontFace;
    this.inputTextBoxPlaceholder = inputTextBoxPlaceholder;

    this.buttonX = buttonX + x;
    this.buttonY = buttonY + y;
    this.buttonBgColor = buttonBgColor;
    this.buttonSizeX = buttonSizeX;
    this.buttonSizeY = buttonSizeY;
    this.buttonFontSize = buttonFontSize;
    this.buttonFontFace = buttonFontFace;

    /**
     * A function called when the submit button is clicked, produces an alert displaying the text currently contained in inputbox
     *
     * @return an alert displaying input text.
     */
    function alertTestIn() {
      const c = (document.getElementById('nameInput') as HTMLInputElement)!.value;
      alert('Name: ' + c);
    }

    /**
     * A function to return the current value stored in the input box element to the caller.
     * @return the value stored in inputTextBox
     * Disabled currently to avoid compiler warning on unused function.
     */
    /*
    function returnInputValue() {
      const text = (document.getElementById("nameInput") as HTMLInputElement)!.value;
      return text;
    }*/

    //creates an input text box with given properties and script
    const inputScript = `<input type = "text" id = "nameInput" name = "fname" style="background-color: ${this.inputTextBoxBgColor}; width: ${this.inputTextBoxSizeX}px; height: ${this.inputTextBoxSizeY}px; font: ${this.inputTextBoxFontSize}px ${this.inputTextBoxFontFace}" placeholder="${this.inputTextBoxPlaceholder}"></input>`;
    this.scene.add.dom(this.inputTextBoxX, this.inputTextBoxY, 'input').createFromHTML(inputScript);

    //creates a submit button with given properties and script
    const buttonScript = `<button id = "submitButton" name = "fbutton" style="background-color: ${this.buttonBgColor}; width: ${this.buttonSizeX}px; height: ${this.buttonSizeY}px; font: ${this.buttonFontSize}px ${this.buttonFontFace}">Submit</input>`;
    const submitButton = this.scene.add
      .dom(this.buttonX, this.buttonY, 'button')
      .createFromHTML(buttonScript);

    //adds listener to the submit button. As of now, alerts the input value. Should return to Game Engine.
    submitButton.addListener('click').on('click', () => {
      alertTestIn();
    });

    this.container = new Phaser.GameObjects.Container(this.scene, x, y);
    this.add(this.container);
  }
}

export default InputGameElement;
