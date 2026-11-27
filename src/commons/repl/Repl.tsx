import { Card, Pre } from '@blueprintjs/core';
import { Ace } from 'ace-builds';
import classNames from 'classnames';
import { useMemo } from 'react';

import type { InterpreterOutput, ResultOutput } from '../application/ApplicationTypes';
import { formatErrors } from '../errors/InterpreterError';
import { formatValue } from '../utils/formatValue';
import { ReplInput } from './ReplInput';
import type { OutputProps } from './ReplTypes';

export type ReplProps = {
  output: InterpreterOutput[];
  replValue: string;
  hidden?: boolean;
  inputHidden?: boolean;
  disableScrolling?: boolean;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleReplEval: () => void;
  handleReplValueChange: (newCode: string) => void;
  onFocus?: (editor: Ace.Editor) => void;
  onBlur?: () => void;
  replButtons: Array<React.ReactElement | null>;
};

function Repl(props: ReplProps) {
  const cards = props.output.map((slice, index) => <Output output={slice} key={index} />);
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
}

function ResultOutputDisplay({ output: { value, consoleLogs } }: { output: ResultOutput }) {
  const stringified = useMemo(() => formatValue(value), [value]);
  if (consoleLogs.length === 0) {
    return (
      <Card>
        <Pre className="result-output">{stringified}</Pre>
      </Card>
    );
  } else {
    return (
      <Card>
        <Pre className="log-output">{consoleLogs.join('\n')}</Pre>
        <Pre className="result-output">{stringified}</Pre>
      </Card>
    );
  }
}

export function Output(props: OutputProps) {
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
      return <ResultOutputDisplay output={props.output} />;
    case 'errors':
      if (props.output.consoleLogs.length === 0) {
        return (
          <Card>
            <Pre className="error-output">{formatErrors(props.output.errors)}</Pre>
          </Card>
        );
      } else {
        return (
          <Card>
            <Pre className="log-output">{props.output.consoleLogs.join('\n')}</Pre>
            <br />
            <Pre className="error-output">{formatErrors(props.output.errors)}</Pre>
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
      return <Card>&apos;&apos;</Card>;
  }
}

export default Repl;
