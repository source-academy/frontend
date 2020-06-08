import * as Phaser from 'phaser';
import { Constants as c } from './utils/constants';
import PlayGame from './scenes/PlayGame';
import { parseDialogue } from './dialogue/DialogueManager';

const TEXT = `[part1]
$narrator
The year is 1101 A.E.
Exponential advances in technology have allowed the human race to traverse light years’ worth of distances in mere hours.
As Earth’s population reached a breaking point, humans began to migrate across the galaxy, colonizing planets once thought uninhabitable, as well as making settlements on those with amicable alien life.
To supplement this rapid expansion, large space stations scattered throughout the solar systems began to emerge, serving as hubs for different human needs.
Nestled deep in the Kepler-62 system, a prestigious facility of learning exists, claiming fame as perhaps the most rigorous inter-galactic educational institute in the universe.
Here, students learn how to harness the power of an invisible force known as the Source, a hidden energy that lets one manipulate the things around them and perform great feats.
Today, you have enrolled in...
The Source Academy!
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
$narration
The strange alien voice startles you. You were so preoccupied you hadn't even noticed the telebay's operator. This is your first time meeting an alien in person. You couldn't help but gawk at him, lost for words.
$scottie
If you exit through that door, the elevator will take you up to the hallway. From there you can access the rest of the ship. Follow the sign at the end of the corridor and you'll find the student quarters. Off you go now!
$you
Oh, um, thanks!
$narr
You hastily make for the door, feeling a little embarassed.
You exit the elevator into a long hallway leading to various rooms. You look around for a sign leading to the student quarters.
$you
Ah, there it is! I can't wait to unload my stuff. It's killing my back. I guess I should've packed lighter.
[Goto part3]

[part3]
$narration
After navigating through long hallways and twisty corridors, you find yourself in front of a room inscribed with your full name.
$you
Oh, here it is!
$narration
Sensing your presence via face and voice-recognition, the door opens smoothly...
..revealing your room inside
Neat! Better start unpacking and settling in!
`;

const config = {
  type: Phaser.CANVAS,
  width: c.screenWidth,
  height: c.screenHeight,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  dom: {
    createContainer: true
  },
  scene: [PlayGame]
};
const phaserGame = new Phaser.Game(config);
export default phaserGame;

parseDialogue(TEXT);
