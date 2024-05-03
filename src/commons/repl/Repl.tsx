import { Card, Pre } from '@blueprintjs/core';
import { Ace } from 'ace-builds';
import classNames from 'classnames';
import { parseError } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';

import { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { ReplInput } from './ReplInput';
import { OutputProps } from './ReplTypes';

export type ReplProps = DispatchProps & StateProps & OwnProps;

type StateProps = {
  output: InterpreterOutput[];
  replValue: string;
  hidden?: boolean;
  inputHidden?: boolean;
  usingSubst?: boolean;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  externalLibrary: ExternalLibraryName;
  disableScrolling?: boolean;
};

type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleReplEval: () => void;
  handleReplValueChange: (newCode: string) => void;
  onFocus?: (editor: Ace.Editor) => void;
  onBlur?: () => void;
};

type OwnProps = {
  replButtons: Array<JSX.Element | null>;
};

const Repl: React.FC<ReplProps> = props => {
  const cards = props.output.map((slice, index) => (
    <Output
      output={slice}
      key={index}
      usingSubst={props.usingSubst ?? false}
      isHtml={props.sourceChapter === Chapter.HTML}
    />
  ));
  return (
    <div className="Repl" style={{ display: props.hidden ? 'none' : undefined }}>
      <div className="repl-output-parent">
        {cards}
        {!props.inputHidden && (
          <Card className={classNames('repl-input-parent', 'row')}>
            <ReplInput {...props} />
          </Card>
        )}
      </div>
    </div>
  );
};

export const Output: React.FC<OutputProps> = props => {
  switch (props.output.type) {
    case 'code':
      return (
        <Card>
          <Pre className="code-output">{props.output.value}</Pre>
        </Card>
      );
    case 'running':
      return (
        <Card>
          <Pre className="log-output">{props.output.consoleLogs.join('\n')}</Pre>
        </Card>
      );
    case 'result':
      // We check if we are using Stepper, so we can process the REPL results properly
      if (props.usingSubst && props.output.value instanceof Array) {
        return (
          <Card>
            <Pre className="log-output">Check out the Stepper tab!</Pre>
          </Card>
        );
      } else if (props.isHtml) {
        return (
          <Card>
            <Pre className="log-output">Check out the HTML Display tab!</Pre>
          </Card>
        );
      } else if (props.output.consoleLogs.length === 0) {
        return (
          <Card>
            <Pre className="result-output">{props.output.value}</Pre>
          </Card>
        );
      } else {
        return (
          <Card>
            <Pre className="log-output">{props.output.consoleLogs.join('\n')}</Pre>
            <Pre className="result-output">{props.output.value}</Pre>
          </Card>
        );
      }
    case 'errors':
      if (props.output.consoleLogs.length === 0) {
        return (
          <Card>
            <Pre className="error-output">{parseError(props.output.errors)}</Pre>
          </Card>
        );
      } else {
        return (
          <Card>
            <Pre className="log-output">{props.output.consoleLogs.join('\n')}</Pre>
            <br />
            <Pre className="error-output">{parseError(props.output.errors)}</Pre>
          </Card>
        );
      }
    case 'notification':
      return (
        <Card className="notification-output-container">
          <Pre className="notification-output">{'💡 ' + props.output.consoleLog}</Pre>
        </Card>
      );
    default:
      return <Card>''</Card>;
  }
};

export default Repl;
