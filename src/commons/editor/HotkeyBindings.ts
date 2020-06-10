// The exec command:
// can either be a: a string, or a function.

import Editor from './Editor';

// User facing KeyBinding to prevent infinite typescript loops
export interface KeyBinding {
  name: string;
  bindKey: { win: string; mac: string };
  exec: (() => void) | string;
}

// Typechecking for keybindings, makes sure that the function is statically available.
// 'exec' MUST be a function available in Editor.
type FunctionsInObject<T> = { [P in keyof T]: T[P] extends Function ? P : never };
type EditorKeys = keyof FunctionsInObject<InstanceType<typeof Editor>>;
interface InternalKeyBinding extends KeyBinding {
  exec: (() => void) | EditorKeys;
}

export const defaultKeyBindings: InternalKeyBinding[] = [
  {
    name: 'evaluate',
    bindKey: {
      win: 'Shift-Enter',
      mac: 'Shift-Enter'
    },
    exec: 'handleEditorEval'
  },
  {
    name: 'navigate',
    bindKey: {
      win: 'Ctrl-B',
      mac: 'Command-B'
    },
    exec: 'handleNavigate'
  },
  {
    name: 'refactor',
    bindKey: {
      win: 'Ctrl-M',
      mac: 'Command-M'
    },
    exec: 'handleRefactor'
  },
  {
    name: 'highlightScope',
    bindKey: {
      win: 'Ctrl-Shift-H',
      mac: 'Command-Shift-H'
    },
    exec: 'handleHighlightScope'
  },
  {
    name: 'TypeInferenceDisplay',
    bindKey: {
      win: 'Ctrl-Shift-M',
      mac: 'Command-Shift-M'
    },
    exec: 'handleTypeInferenceDisplay'
  }
];
