import { Constants as c, Keys as k } from '../utils/constants';
import { PhaserScene } from '../utils/extendedPhaser';
import { addButton } from '../utils/styles';
import { renderDialogue } from '../dialogue/DialogueRenderer';
import { parseDialogue } from '../dialogue/DialogueManager';
import { preloadDialogue } from '../dialogue/DialoguePreloader';

const TEXT = `[part0]
$narrator
The year is 1101 A.E.
Exponential advances in technology have allowed the human race to traverse light years’ worth of distances in mere hours.
[Goto part2]

[part2]
$you, tired
Whew... That was a long trip. It feels like I was on that shuttle for a thousand years.
I guess this is the Source Academy. It’s much bigger than my high school back on Earth. It’s hard to believe this is a space station.
$narrator
The teleportation bay is empty, as far as you can see.
You must have been one of the last to arrive, as all the shuttle services before this were fully-booked.
If only you hadn’t procrastinated so much
$you
Never mind that!
Now, the message I got last week says I’m supposed to find my dorm room the minute I get here...
Oh hi, you must be our last recruit! Everyone else is already getting settled in.
$narrator
The strange alien voice startles you. You were so preoccupied you hadn't even noticed the telebay's operator. This is your first time meeting an alien in person. You couldn't help but gawk at him, lost for words.
$scottie
If you exit through that door, the elevator will take you up to the hallway. From there you can access the rest of the ship. Follow the sign at the end of the corridor and you'll find the student quarters. Off you go now!
$you
Oh, um, thanks!
$narrator
You hastily make for the door, feeling a little embarassed.
You exit the elevator into a long hallway leading to various rooms. You look around for a sign leading to the student quarters.
$you
Ah, there it is! I can't wait to unload my stuff. It's killing my back. I guess I should've packed lighter.
[Goto part3]

[part3]
$narrator
After navigating through long hallways and twisty corridors, you find yourself in front of a room inscribed with your full name.
$you
Oh, here it is!
$narrator
Sensing your presence via face and voice-recognition, the door opens smoothly...
..revealing your room inside
Neat! Better start unpacking and settling in!
`;

class PlayGame extends PhaserScene {
  constructor() {
    super('PlayGame');
  }

  public init() {}

  public preload() {
    preloadDialogue(this, TEXT);
    this.load.image('bg', c.assetsFolder + '/locations/yourRoom-dim/normal.png');
    this.load.on('filecomplete', (key: string) => this.handleLoadComplete(key));
  }

  public create() {
    this.addElementsToScene();
  }

  private addElementsToScene() {
    this.addImage(c.centerX, c.centerY, 'bg').resize(c.screenWidth, c.screenHeight);

    addButton(this, 'Add avatar', () => this.addAssetToScene(), {
      x: c.screenWidth * 0.5,
      y: c.screenHeight * 0.9
    });

    renderDialogue(this, parseDialogue(TEXT));
  }

  private addAssetToScene() {
    const selectedAsset = sessionStorage.getItem(k.selectedAsset) || '';
    this.load.image('$' + selectedAsset, c.assetsFolder + selectedAsset);
    this.load.start();
  }

  private handleLoadComplete(key: string) {
    switch (true) {
      case key[0] === '$':
        this.addImage(c.centerX, c.centerY, key)
          .resize(c.screenWidth / 4)
          .setInteractive({ pixelPerfect: true, useHandCursor: true });
    }
  }
}

export default PlayGame;
