import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import * as React from 'react';
import AceEditor from 'react-ace';

import SicpWorkspaceContainer from '../../../features/sicp/components/SicpWorkspaceContainer';
import { CodeSnippetContext } from './SicpDisplay';

type CodeSnippetProps = OwnProps;
type OwnProps = {
  body: string;
  output: string;
  id: string;
};

const CodeSnippet: React.FC<CodeSnippetProps> = props => {
  const { body, output, id } = props;
  const context = React.useContext(CodeSnippetContext);

  const handleOpen = () => {
    context.setActive(id);
  };

  const handleClose = () => {
    context.setActive('0');
  };

  const WorkspaceProps = {
    initialEditorValue: body,

    handleCloseEditor: handleClose
  };

  HighlightRulesSelector(4);
  ModeSelector(4);

  return (
    <div className="sicp-code-snippet">
      {context.active === id ? (
        <SicpWorkspaceContainer {...WorkspaceProps} />
      ) : (
        <>
          <div className="code-body" onClick={handleOpen}>
            <AceEditor
              className="react-ace"
              mode="source4defaultNONE"
              theme="source"
              fontSize={20}
              highlightActiveLine={false}
              wrapEnabled={true}
              height="unset"
              width="100%"
              showGutter={false}
              showPrintMargin={false}
              readOnly={true}
              maxLines={Infinity}
              value={body.replace(/\n$/, '') + ' '}
              setOptions={{
                fontFamily: "'Inconsolata', 'Consolas', monospace"
              }}
            />
          </div>
          {output ? (
            <pre className="code-result">
              <code>{output}</code>
            </pre>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default CodeSnippet;
