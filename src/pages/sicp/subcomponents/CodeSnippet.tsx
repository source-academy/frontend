import { Card, Elevation, Pre } from '@blueprintjs/core';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Resizable } from 're-resizable';
import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import ControlBar from 'src/commons/controlBar/ControlBar';
import { ControlBarCloseButton } from 'src/commons/controlBar/ControlBarCloseButton';
import { useResponsive } from 'src/commons/utils/Hooks';
import { SourceTheme } from 'src/features/sicp/SourceTheme';
import Playground from 'src/pages/playground/Playground';

import { CodeSnippetContext } from '../Sicp';

export type CodeSnippetProps = OwnProps;
type OwnProps = {
  body: string;
  output: string;
  id: string;
  initialEditorValueHash: string;
  prependLength: number | undefined;
};

const resizableProps = {
  enable: {
    top: false,
    right: false,
    bottom: true,
    left: false,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
    topLeft: false
  },
  defaultSize: {
    width: '100%',
    height: '500px'
  },
  minHeight: '250px',
  maxHeight: '2000px'
};

const CodeSnippet: React.FC<CodeSnippetProps> = props => {
  const { body, output, id } = props;
  const context = React.useContext(CodeSnippetContext);
  const { isMobileBreakpoint } = useResponsive();

  const handleOpen = () => {
    context.setActive(id);
  };

  const handleClose = React.useCallback(() => {
    context.setActive('0');
  }, [context]);

  const WorkspaceProps = {
    initialEditorValueHash: props.initialEditorValueHash,
    prependLength: props.prependLength,
    isSicpEditor: true,

    handleCloseEditor: handleClose
  };

  HighlightRulesSelector(4);
  ModeSelector(4);

  const closeButton = React.useMemo(
    () => <ControlBarCloseButton key="close" handleClose={handleClose} />,
    [handleClose]
  );

  const controlBarProps = {
    editorButtons: [],
    flowButtons: [],
    editingWorkspaceButtons: [closeButton]
  };

  return (
    <div className="sicp-code-snippet">
      {context.active === id ? (
        <div className="sicp-code-snippet-open">
          <ControlBar {...controlBarProps} />
          {isMobileBreakpoint ? (
            <div className="sicp-workspace-container-container">
              <Playground {...WorkspaceProps} />
            </div>
          ) : (
            <div className="sicp-code-snippet-desktop-open">
              <Resizable {...resizableProps}>
                <div className="sicp-workspace-container-container">
                  <Playground {...WorkspaceProps} />
                </div>
              </Resizable>
            </div>
          )}
        </div>
      ) : (
        <Card className="sicp-code-snippet-closed" interactive={true} elevation={Elevation.TWO}>
          <SyntaxHighlighter language="javascript" style={SourceTheme} onClick={handleOpen}>
            {body}
          </SyntaxHighlighter>
        </Card>
      )}
      {output && (
        <Pre>
          <em>{output}</em>
        </Pre>
      )}
    </div>
  );
};

export default CodeSnippet;
