import { Card, Elevation } from '@blueprintjs/core';
import { compressToEncodedURIComponent } from 'lz-string';
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import ControlBar from 'src/commons/controlBar/ControlBar';
import { ControlBarCloseButton } from 'src/commons/controlBar/ControlBarCloseButton';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { SourceTheme } from 'src/features/sicp/SourceTheme';
import Playground from 'src/pages/playground/Playground';

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

  // Generate the hash for the Playground (memoized to avoid recomputation)
  const initialEditorValueHash = useMemo(() => {
    // The hash format expected by Playground is based on parseQuery
    // We need to create a query string with 'prgrm' containing the compressed code
    return `prgrm=${compressToEncodedURIComponent(code)}`;
  }, [code]);

  const handleOpen = () => {
    dispatch(WorkspaceActions.resetWorkspace('sicp'));
    dispatch(WorkspaceActions.toggleUsingSubst(false, 'sicp'));
    setActiveSnippet(id);
  };

  const handleClose = React.useCallback(() => {
    setActiveSnippet('');
  }, [setActiveSnippet]);

  const WorkspaceProps = {
    initialEditorValueHash,
    prependLength: undefined,
    isSicpEditor: true,
    handleCloseEditor: handleClose
  };

  const closeButton = useMemo(
    () => <ControlBarCloseButton key="close" handleClose={handleClose} />,
    [handleClose]
  );

  const controlBarProps = {
    editorButtons: [],
    flowButtons: [],
    editingWorkspaceButtons: [closeButton]
  };

  // Render the open editor as a portal to document.body so it's outside the chat container
  const editorOverlay = isActive
    ? createPortal(
        <div className="chatbot-snippet-overlay">
          <div className="chatbot-code-snippet-open">
            <ControlBar {...controlBarProps} />
            <div className="chatbot-code-snippet-desktop-open">
              <div className="chatbot-workspace-container">
                <Playground {...WorkspaceProps} />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {editorOverlay}
      <Card
        className="chatbot-code-snippet-closed"
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
