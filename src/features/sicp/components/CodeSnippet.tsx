import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import * as React from 'react';
import { useState } from 'react';
import AceEditor from 'react-ace';

import SicpWorkspace from './SicpWorkspace';

type CodeSnippetProps = OwnProps;
type OwnProps = {
  body: string;
  output: string;
};

const CodeSnippet: React.FC<CodeSnippetProps> = props => {
  const { body, output } = props;

  const [open, setOpen] = useState(false);

  const onClick = () => {
    setOpen(!open);
  };

  const WorkspaceProps = {
    editorValue: body,

    handleCloseEditor: onClick
  };

  HighlightRulesSelector(4);
  ModeSelector(4);

  return (
    <div className="sicp-code-snippet">
      {open ? (
        <SicpWorkspace {...WorkspaceProps} />
      ) : (
        <>
          <div className="code-body" onClick={onClick}>
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
          {output ? <pre className="code-result"><code>{output}</code></pre> : <></>}
        </>
      )}
    </div>
  );
};

export default CodeSnippet;
