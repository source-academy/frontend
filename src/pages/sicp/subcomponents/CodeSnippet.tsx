import { Card, Elevation, Pre } from '@blueprintjs/core';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Resizable } from 're-resizable';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import ControlBar from 'src/commons/controlBar/ControlBar';
import { ControlBarCloseButton } from 'src/commons/controlBar/ControlBarCloseButton';
import { ControlBarShowDependenciesButton } from 'src/commons/controlBar/ControlBarShowDependenciesButton';
import Constants from 'src/commons/utils/Constants';
import { SourceTheme } from 'src/features/sicp/SourceTheme';

import { CodeSnippetContext } from '../Sicp';
import SicpWorkspaceContainer from './SicpWorkspaceContainer';

export type CodeSnippetProps = OwnProps;
type OwnProps = {
  body: string;
  output: string;
  id: string;
  initialEditorValueHash: string;
  initialPrependHash: string | undefined;
  initialFullProgramHash: string | undefined;
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
  const [showPrepend, setShowPrepend] = React.useState(false);
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  const handleShowDependencies = React.useCallback(() => {
    setShowPrepend(!showPrepend);
  }, [showPrepend]);

  const handleOpen = () => {
    context.setActive(id);
  };

  const handleClose = React.useCallback(() => {
    context.setActive('0');
  }, [context]);

  const WorkspaceProps = {
    initialEditorValueHash: showPrepend
      ? props.initialFullProgramHash
      : props.initialEditorValueHash,
    initialPrependHash: showPrepend ? undefined : props.initialPrependHash,
    initialFullProgramHash: props.initialFullProgramHash,
    isSicpEditor: true,

    handleCloseEditor: handleClose
  };

  HighlightRulesSelector(4);
  ModeSelector(4);

  const closeButton = React.useMemo(
    () => <ControlBarCloseButton key="close" handleClose={handleClose} />,
    [handleClose]
  );

  const showDependenciesButton = React.useMemo(
    () => (
      <ControlBarShowDependenciesButton
        key="dependencies"
        buttonText={showPrepend ? 'Hide Dependencies' : 'Show Dependencies'}
        handleShowDependencies={handleShowDependencies}
      />
    ),
    [handleShowDependencies, showPrepend]
  );

  const controlBarProps = {
    editorButtons: props.initialPrependHash ? [showDependenciesButton] : [],
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
              <SicpWorkspaceContainer {...WorkspaceProps} />
            </div>
          ) : (
            <div className="sicp-code-snippet-desktop-open">
              <Resizable {...resizableProps}>
                <div className="sicp-workspace-container-container">
                  <SicpWorkspaceContainer {...WorkspaceProps} />
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
      {output && <Pre>{output}</Pre>}
    </div>
  );
};

export default CodeSnippet;
