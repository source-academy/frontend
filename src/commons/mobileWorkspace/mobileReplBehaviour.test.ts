import { describe, expect, test } from 'vitest';

import { SideContentType } from '../sideContent/SideContentTypes';
import { mobileReplBehaviour } from './mobileReplBehaviour';

const RUN = SideContentType.mobileEditorRun;
// A plugin's tab that hides the REPL (its `hidesRepl` in the plugin directory), as the Stepper's does.
const PLUGIN_TAB = 'plugin-tab';
const hidesRepl = (tabId: string) => tabId === PLUGIN_TAB;

describe('mobileReplBehaviour', () => {
  test('pressing Run from an ordinary tab shows a draggable REPL', () => {
    expect(mobileReplBehaviour(RUN, SideContentType.mobileEditor)).toEqual({
      showRepl: true,
      disableDragging: false,
    });
  });

  test.each([PLUGIN_TAB])('pressing Run from %s keeps the REPL hidden and fixed', tab => {
    expect(mobileReplBehaviour(RUN, tab, hidesRepl)).toEqual({
      showRepl: false,
      disableDragging: true,
    });
  });

  test.each([SideContentType.autograder, SideContentType.testcases])(
    'pressing Run from %s keeps the REPL hidden',
    tab => {
      expect(mobileReplBehaviour(RUN, tab)).toEqual({ showRepl: false, disableDragging: false });
    },
  );

  test.each([SideContentType.folder, PLUGIN_TAB])(
    'opening %s hides the REPL and disables dragging',
    tab => {
      expect(mobileReplBehaviour(tab, SideContentType.mobileEditor, hidesRepl)).toEqual({
        showRepl: false,
        disableDragging: true,
      });
    },
  );

  test('a plugin tab that does not hide the REPL leaves it as for an ordinary tab', () => {
    expect(mobileReplBehaviour(RUN, 'other-plugin-tab', hidesRepl)).toEqual({
      showRepl: true,
      disableDragging: false,
    });
  });
});
