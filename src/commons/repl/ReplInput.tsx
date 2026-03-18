import { Classes } from '@blueprintjs/core';
import { Ace } from 'ace-builds';
import classNames from 'classnames';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';
import AceEditor from 'react-ace';
import ReactAce from 'react-ace/lib/ace';

import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { getModeString, selectMode } from '../utils/AceHelper';
import { useResponsive } from '../utils/Hooks';
// source mode and chapter imported in Editor.tsx

export type ReplInputProps = DispatchProps & StateProps & OwnProps;

type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleReplValueChange: (newCode: string) => void;
  handleReplEval: () => void;
  onFocus?: (editor: Ace.Editor) => void;
  onBlur?: () => void;
};

type StateProps = {
  replValue: string;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  externalLibrary: ExternalLibraryName;
  disableScrolling?: boolean;
};

type OwnProps = {
  replButtons: Array<JSX.Element | null>;
};

export const ReplInput: React.FC<ReplInputProps> = props => {
  const { onFocus, onBlur } = props;

  const replInput = React.useRef<ReactAce>(null);
  const replInputBottom = React.useRef<HTMLDivElement>(null);

  const { isDesktopBreakpoint } = useResponsive();

  const execBrowseHistoryDown: () => void = props.handleBrowseHistoryDown;
  const execBrowseHistoryUp: () => void = props.handleBrowseHistoryUp;
  const execEvaluate = () => {
    props.handleReplEval();
    if (replInputBottom.current && !props.disableScrolling) {
      /**
       * Ensures the REPL AceEditor input is always in view even after multiple REPL eval calls.
       * This feature is disabled in the mobile workspace as it interferes with the UX of the DraggableRepl.
       */
      replInputBottom.current.scrollIntoView();
    }
  };

  React.useEffect(() => {
    if (!replInput.current) {
      return;
    }
    const editor = replInput.current.editor;
    if (onFocus) {
      editor.on('focus', () => onFocus(editor));
    }
    if (onBlur) {
      editor.on('blur', onBlur);
    }
  });

  React.useEffect(() => {
    if (!replInputBottom.current || props.disableScrolling) {
      return;
    }
    if (replInputBottom.current.clientWidth >= window.innerWidth - 50) {
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
      replInputBottom.current.scrollIntoView();
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
        ref={replInput}
      />
      <div className={classNames(Classes.BUTTON_GROUP, Classes.DARK)}>{replButtons()}</div>
      {isDesktopBreakpoint && <div ref={replInputBottom} />}
    </>
  );
};
