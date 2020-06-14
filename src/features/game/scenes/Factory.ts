import { PartName, DialogueLine } from '../dialogue/GameDialogueTypes';
import { createGameAction } from '../action/GameActionTypes';
import { createSpeaker } from '../character/GameCharacterTypes';

const DialogueObject1 = new Map<PartName, DialogueLine[]>();
DialogueObject1.set('part1', [
  {
    line: "How's it going?",
    speakerDetail: createSpeaker('beat', 'happy', 'right'),
    actions: [
      createGameAction('collectible', { id: 'trophy' }),
      createGameAction('obtainObject', { id: 'yourCarpet' })
    ]
  },
  {
    line: 'It is time for Kepler'
  },
  {
    line: 'How many years was it because it certainly feels like a thousand years',
    speakerDetail: null,
    actions: [createGameAction('collectible', { id: 'years' })]
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
    actions: [createGameAction('collectible', { id: 'cookies' })]
  },
  {
    line: 'Let me lead you to the classroom',
    actions: [createGameAction('locationChange', { id: 'Emergency' })]
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
