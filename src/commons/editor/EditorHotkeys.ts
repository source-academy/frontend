export type KeyFunction = keyof typeof keyBindings;

export const keyBindings = {
  evaluate: {
    win: 'Shift-Enter',
    mac: 'Shift-Enter'
  },
  // {
  //   name: 'navigate',
  //   bindKey: {
  //     win: 'Ctrl-B',
  //     mac: 'Command-B'
  //   },
  //   exec: 'handleNavigate'
  // },
  // {
  //   name: 'refactor',
  //   bindKey: {
  //     win: 'Ctrl-M',
  //     mac: 'Command-M'
  //   },
  //   exec: 'handleRefactor'
  // },
  highlightScope: {
    win: 'Ctrl-Shift-H',
    mac: 'Command-Shift-H'
  }
  // {
  //   name: 'TypeInferenceDisplay',
  //   bindKey: {
  //     win: 'Ctrl-Shift-M',
  //     mac: 'Command-Shift-M'
  //   },
  //   exec: 'handleTypeInferenceDisplay'
  // }
};
