import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';
import AceEditor from 'react-ace';
import MediaQuery from 'react-responsive';

import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { getModeString, selectMode } from '../utils/AceHelper';
// source mode and chapter imported in Editor.tsx

export type ReplInputProps = DispatchProps & StateProps & OwnProps;

type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleReplValueChange: (newCode: string) => void;
  handleReplEval: () => void;
};

type StateProps = {
  replValue: string;
  sourceChapter: number;
  sourceVariant: Variant;
  externalLibrary: ExternalLibraryName;
};

type OwnProps = {
  replButtons: Array<JSX.Element | null>;
};

export const ReplInput = React.forwardRef<AceEditor, ReplInputProps>((props, ref) => {
  const replInputBottom = document.getElementById('replInputButtom');
  const execBrowseHistoryDown: () => void = props.handleBrowseHistoryDown;
  const execBrowseHistoryUp: () => void = props.handleBrowseHistoryUp;
  const execEvaluate = () => {
    if (!replInputBottom) {
      return;
    } else {
      replInputBottom.scrollIntoView();
      props.handleReplEval();
    }
  };

  React.useEffect(() => {
    if (!replInputBottom) {
      return;
    }
    if (replInputBottom.clientWidth >= window.innerWidth - 50) {
      /* There is a bug where
       *   if the workspace has been resized via re-resizable such that the
       *   has disappeared off the screen, width 63
       * then
       *   calling scrollIntoView would cause the Repl to suddenly take up 100%
       *   of the screen width. This pushes the editor off-screen so that the
       *   user can no longer resize the workspace at all
       * Fix: the if condition is true when the Repl has dissapeared off-screen.
       *   (-15 to account for the scrollbar */
    } else {
      replInputBottom.scrollIntoView();
    }
  });

  // see the comment above this same call in Editor.tsx
  selectMode(props.sourceChapter, props.sourceVariant, props.externalLibrary);

  const replButtons = () => props.replButtons;

  return (
    <>
      <AceEditor
        className="repl-react-ace react-ace"
        mode={getModeString(props.sourceChapter, props.sourceVariant, props.externalLibrary)}
        theme="source"
        height="1px"
        width="100%"
        value={props.replValue}
        onChange={props.handleReplValueChange}
        commands={[
          {
            name: 'browseHistoryDown',
            bindKey: {
              win: 'Down',
              mac: 'Down'
            },
            exec: execBrowseHistoryDown
          },
          {
            name: 'browseHistoryUp',
            bindKey: {
              win: 'Up',
              mac: 'Up'
            },
            exec: execBrowseHistoryUp
          },
          {
            name: 'evaluate',
            bindKey: {
              win: 'Shift-Enter',
              mac: 'Shift-Enter'
            },
            exec: execEvaluate
          }
        ]}
        minLines={1}
        maxLines={20}
        fontSize={17}
        highlightActiveLine={false}
        showGutter={false}
        showPrintMargin={false}
        setOptions={{
          fontFamily: "'Inconsolata', 'Consolas', monospace"
        }}
        ref={ref}
      />
      <div className={classNames(Classes.BUTTON_GROUP, Classes.DARK)}>{replButtons()}</div>
      <MediaQuery minWidth={769}>
        <div className="replInputBottom" id="replInputBottom" />
      </MediaQuery>
    </>
  );
});
