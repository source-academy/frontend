import { Card, Elevation, Overlay2 } from '@blueprintjs/core';
import { compressToEncodedURIComponent } from 'lz-string';
import React from 'react';
import { useDispatch } from 'react-redux';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import ControlBar from 'src/commons/controlBar/ControlBar';
import { ControlBarCloseButton } from 'src/commons/controlBar/ControlBarCloseButton';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { SourceTheme } from 'src/features/sicp/SourceTheme';
import Playground from 'src/pages/playground/Playground';
import classes from 'src/styles/ChatbotCodeSnippet.module.scss';

export type ChatbotCodeSnippetProps = {
  /** The code to display and run */
  code: string;
  /** Unique ID for this snippet (used to track which is active) */
  id: string;
  /** The active snippet ID */
  activeSnippetId: string;
  /** Callback to set the active snippet */
  setActiveSnippet: (id: string) => void;
  /** Language for syntax highlighting (defaults to 'javascript') */
  language?: string;
};

/**
 * A code snippet component for the chatbot that mimics the SICP code snippet behavior.
 * When closed, it shows syntax-highlighted code that's clickable.
 * When open, it shows a full Playground editor where the user can run the code.
 */
const ChatbotCodeSnippet: React.FC<ChatbotCodeSnippetProps> = ({
  code,
  id,
  activeSnippetId,
  setActiveSnippet,
  language = 'javascript'
}) => {
  const dispatch = useDispatch();

  const isActive = activeSnippetId === id;

  // Generate the hash for the Playground
  const initialEditorValueHash = `prgrm=${compressToEncodedURIComponent(code)}`;

  const handleOpen = () => {
    dispatch(WorkspaceActions.resetWorkspace('sicp'));
    dispatch(WorkspaceActions.toggleUsingSubst(false, 'sicp'));
    setActiveSnippet(id);
  };

  const handleClose = React.useCallback(() => {
    setActiveSnippet('');
  }, [setActiveSnippet]);

  const workspaceProps = {
    initialEditorValueHash,
    prependLength: undefined,
    isSicpEditor: true,
    handleCloseEditor: handleClose
  };

  const closeButton = <ControlBarCloseButton key="close" handleClose={handleClose} />;

  const controlBarProps = {
    editorButtons: [],
    flowButtons: [],
    editingWorkspaceButtons: [closeButton]
  };

  return (
    <>
      <Overlay2
        hasBackdrop={true}
        isOpen={isActive}
        transitionDuration={0}
        backdropProps={{
          style: { position: 'fixed' }
        }}
      >
        <div className={classes['snippet-open']}>
          <ControlBar {...controlBarProps} />
          <div className={classes['desktop-open']}>
            <div className={classes['workspace-container']}>
              <Playground {...workspaceProps} />
            </div>
          </div>
        </div>
      </Overlay2>
      <Card
        className={classes['snippet-closed']}
        interactive={true}
        elevation={Elevation.TWO}
        onClick={handleOpen}
      >
        <SyntaxHighlighter language={language} style={SourceTheme}>
          {code}
        </SyntaxHighlighter>
      </Card>
    </>
  );
};

export default ChatbotCodeSnippet;
