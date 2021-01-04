import { Card, Classes, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import { parseError } from 'js-slang';
import { Variant } from 'js-slang/dist/types';
import { stringify } from 'js-slang/dist/utils/stringify';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';

import { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import SideContentCanvasOutput from '../sideContent/SideContentCanvasOutput';
import ReplInput from './ReplInput';
import { OutputProps } from './ReplTypes';

export type ReplProps = DispatchProps & StateProps;

type StateProps = {
  output: InterpreterOutput[];
  replValue: string;
  hidden?: boolean;
  inputHidden?: boolean;
  usingSubst?: boolean;
  sourceChapter: number;
  sourceVariant: Variant;
  externalLibrary: ExternalLibraryName;
};

type DispatchProps = {
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleReplEval: () => void;
  handleReplValueChange: (newCode: string) => void;
};

class Repl extends React.PureComponent<ReplProps, {}> {
  public constructor(props: ReplProps) {
    super(props);
  }

  public render() {
    const cards = this.props.output.map((slice, index) => (
      <Output output={slice} key={index} usingSubst={this.props.usingSubst || false} />
    ));
    return (
      <div className="Repl" style={{ display: this.props.hidden ? 'none' : undefined }}>
        <div className="repl-output-parent">
          {cards}
          {!this.props.inputHidden && (
            <HotKeys
              className={classNames('repl-input-parent', 'row', Classes.CARD, Classes.ELEVATION_0)}
              handlers={handlers}
            >
              <ReplInput {...this.props} />
            </HotKeys>
          )}
        </div>
      </div>
    );
  }
}

export const Output: React.FC<OutputProps> = (props: OutputProps) => {
  switch (props.output.type) {
    case 'code':
      return (
        <Card>
          <Pre className="codeOutput">{props.output.value}</Pre>
        </Card>
      );
    case 'running':
      return (
        <Card>
          <Pre className="logOutput">{props.output.consoleLogs.join('\n')}</Pre>
        </Card>
      );
    case 'result':
      // We check if we are using Stepper, so we can process the REPL results properly
      if (props.usingSubst && props.output.value instanceof Array) {
        return (
          <Card>
            <Pre className="logOutput">Check out the substituter tab!</Pre>
          </Card>
        );
      } else if (props.output.consoleLogs.length === 0) {
        return (
          <Card>
            <Pre className="resultOutput">{renderResult(props.output.value)}</Pre>
          </Card>
        );
      } else {
        return (
          <Card>
            <Pre className="logOutput">{props.output.consoleLogs.join('\n')}</Pre>
            <Pre className="resultOutput">{renderResult(props.output.value)}</Pre>
          </Card>
        );
      }
    case 'errors':
      if (props.output.consoleLogs.length === 0) {
        return (
          <Card>
            <Pre className="errorOutput">{parseError(props.output.errors)}</Pre>
          </Card>
        );
      } else {
        return (
          <Card>
            <Pre className="logOutput">{props.output.consoleLogs.join('\n')}</Pre>
            <br />
            <Pre className="errorOutput">{parseError(props.output.errors)}</Pre>
          </Card>
        );
      }
    default:
      return <Card>''</Card>;
  }
};

const renderResult = (value: any) => {
  /** A class which is the output of the show() function */
  const ShapeDrawn = (window as any).ShapeDrawn;
  if (typeof ShapeDrawn !== 'undefined' && value instanceof ShapeDrawn) {
    return <SideContentCanvasOutput canvas={value.$canvas} />;
  } else {
    return stringify(value);
  }
};

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

export default Repl;
