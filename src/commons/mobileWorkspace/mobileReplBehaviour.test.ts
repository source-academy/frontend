import {
  CONDUCTOR_E_STEPPER_TAB_ID,
  CONDUCTOR_STEPPER_TAB_ID,
} from 'src/features/conductor/stepperTab';
import { describe, expect, test } from 'vitest';

import { SideContentType } from '../sideContent/SideContentTypes';
import { mobileReplBehaviour } from './mobileReplBehaviour';

const RUN = SideContentType.mobileEditorRun;

describe('mobileReplBehaviour', () => {
  test('pressing Run from an ordinary tab shows a draggable REPL', () => {
    expect(mobileReplBehaviour(RUN, SideContentType.mobileEditor)).toEqual({
      showRepl: true,
      disableDragging: false,
    });
  });

  test.each([
    SideContentType.substVisualizer,
    SideContentType.cseMachine,
    CONDUCTOR_STEPPER_TAB_ID,
    CONDUCTOR_E_STEPPER_TAB_ID,
  ])('pressing Run from %s keeps the REPL hidden and fixed', tab => {
    expect(mobileReplBehaviour(RUN, tab)).toEqual({ showRepl: false, disableDragging: true });
  });

  test.each([SideContentType.autograder, SideContentType.testcases])(
    'pressing Run from %s keeps the REPL hidden',
    tab => {
      expect(mobileReplBehaviour(RUN, tab)).toEqual({ showRepl: false, disableDragging: false });
    },
  );

  test.each([
    SideContentType.folder,
    SideContentType.cseMachine,
    CONDUCTOR_STEPPER_TAB_ID,
    CONDUCTOR_E_STEPPER_TAB_ID,
  ])('opening %s hides the REPL and disables dragging', tab => {
    expect(mobileReplBehaviour(tab, SideContentType.mobileEditor)).toEqual({
      showRepl: false,
      disableDragging: true,
    });
  });
});
