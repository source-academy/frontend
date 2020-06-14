import { PartName, DialogueLine } from '../dialogue/GameDialogueTypes';
import { createGameAction } from '../action/GameActionTypes';
import { createSpeaker } from '../dialogue/DialogueHelper';

const DialogueObject1 = new Map<PartName, DialogueLine[]>();
DialogueObject1.set('part1', [
  {
    line: "How's it going?",
    speakerDetail: createSpeaker('beat', 'happy', 'right'),
    action: [
      createGameAction('collectible', ['trophy']),
      createGameAction('removeObject', ['yourCarpet'])
    ]
  },
  {
    line: 'It is time for Kepler'
  },
  {
    line: 'How many years was it because it certainly feels like a thousand years',
    speakerDetail: null,
    action: [createGameAction('collectible', ['years'])]
  },
  {
    line: 'How many years was it because it certainly feels like a thousand years'
  },
  {
    line: "Hi, I'm Scottie, the Scottish alien",
    speakerDetail: createSpeaker('scottie', 'happy', 'left'),
    goto: 'part2'
  }
]);

DialogueObject1.set('part2', [
  {
    line: 'Hi this is part2, are you still interested?'
  },
  {
    line: "The Earth that you've inhabited has been destroyed by a comet."
  },
  {
    line: "Here's a jar of cookies to help you feel better",
    action: [createGameAction('collectible', ['years'])]
  },
  {
    line: 'How many years was it because it certainly feels like a thousand years'
  },
  {
    line: "Hi, I'm Scottie, the Scottish alien",
    speakerDetail: createSpeaker('scottie', 'sad', 'left'),
    goto: 'part3'
  }
]);

export const dialogue1 = {
  title: 'What happened?',
  content: DialogueObject1,
  startPart: 'part1'
};

export const dialogue2 = {
  title: 'Are you sure?',
  content: DialogueObject1,
  startPart: 'part1'
};
