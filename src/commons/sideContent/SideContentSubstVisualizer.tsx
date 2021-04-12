/* eslint-disable simple-import-sort/imports */
import { Card, Classes, Divider, Pre, Slider, Button, ButtonGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import AceEditor from 'react-ace';
import { HotKeys } from 'react-hotkeys';

import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import 'js-slang/dist/editors/ace/theme/source';
import { IStepperPropContents } from 'js-slang/dist/stepper/stepper';

import controlButton from '../ControlButton';
import { isEqual } from 'lodash';

const SubstDefaultText = () => {
  return (
    <div>
      <div id="substituter-default-text" className={Classes.RUNNING_TEXT}>
        Welcome to the Stepper!
        <br />
        <br />
        On this tab, the REPL will be hidden from view, so do check that your code has no errors
        before running the stepper. You may use this tool by writing your program on the left, then
        dragging the slider above to see its evaluation.
        <br />
        <br />
        On even-numbered steps, the part of the program that will be evaluated next is highlighted
        in yellow. On odd-numbered steps, the result of the evaluation is highlighted in green. You
        can change the maximum steps limit (500-5000, default 1000) in the control bar.
        <br />
        <br />
        <Divider />
        Some useful keyboard shortcuts:
        <br />
        <br />
        {controlButton('(Comma)', IconNames.LESS_THAN)}: Move to the first step
        <br />
        {controlButton('(Period)', IconNames.GREATER_THAN)}: Move to the last step
        <br />
        <br />
        Note that the first and last step shortcuts are only active when the browser focus is on
        this panel (click on the slider or the text!).
        <br />
        <br />
        When the focus is on the slider, the arrow keys may also be used to move a single step.
      </div>
    </div>
  );
};

const substKeyMap = {
  FIRST_STEP: ',',
  LAST_STEP: '.'
};

const SubstCodeDisplay = (props: { content: string }) => {
  return (
    <Card>
      <Pre className="resultOutput">{props.content}</Pre>
    </Card>
  );
};

type SubstVisualizerProps = StateProps;

type StateProps = {
  content: IStepperPropContents[];
};

type State = {
  value: number;
};

class SideContentSubstVisualizer extends React.Component<SubstVisualizerProps, State> {
  constructor(props: SubstVisualizerProps) {
    super(props);
    this.state = {
      value: 1
    };

    // set source mode as 2
    HighlightRulesSelector(2);
    ModeSelector(2);
  }

  public render() {
    const lastStepValue = this.props.content.length;
    // 'content' property is initialised to '[]' by Playground component
    const hasRunCode = lastStepValue !== 0;
    const substHandlers = hasRunCode
      ? {
          FIRST_STEP: this.stepFirst,
          LAST_STEP: this.stepLast(lastStepValue)
        }
      : {
          FIRST_STEP: () => {},
          LAST_STEP: () => {}
        };
    // console.log(this.props.content);

    return (
      <HotKeys keyMap={substKeyMap} handlers={substHandlers}>
        <div>
          <div className="sa-substituter">
            <Slider
              disabled={!hasRunCode}
              min={1}
              max={this.props.content.length}
              onChange={this.sliderShift}
              value={this.state.value <= lastStepValue ? this.state.value : 1}
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ButtonGroup>
                <Button
                  disabled={!hasRunCode || !this.hasPreviousFunctionCall(this.state.value)}
                  icon="double-chevron-left"
                  onClick={this.stepPreviousFunctionCall(this.state.value)}
                />
                <Button
                  disabled={!hasRunCode || this.state.value === 1}
                  icon="chevron-left"
                  onClick={this.stepPrevious}
                />
                <Button
                  disabled={!hasRunCode || this.state.value === lastStepValue}
                  icon="chevron-right"
                  onClick={this.stepNext}
                />
                <Button
                  disabled={!hasRunCode || !this.hasNextFunctionCall(this.state.value)}
                  icon="double-chevron-right"
                  onClick={this.stepNextFunctionCall(this.state.value)}
                />
              </ButtonGroup>
            </div>{' '}
            <br />
            {hasRunCode ? (
              <AceEditor
                className="react-ace"
                mode="source2defaultNONE"
                theme="source"
                fontSize={17}
                highlightActiveLine={false}
                wrapEnabled={true}
                height="unset"
                width="100%"
                showGutter={false}
                readOnly={true}
                maxLines={Infinity}
                value={this.getText(this.state.value)}
                markers={this.getDiffMarkers(this.state.value)}
                setOptions={{
                  fontFamily: "'Inconsolata', 'Consolas', monospace"
                }}
              />
            ) : (
              <SubstDefaultText />
            )}
            {hasRunCode ? (
              <SubstCodeDisplay
                content={
                  this.state.value <= lastStepValue
                    ? this.props.content[this.state.value - 1].explanation
                    : this.props.content[0].explanation
                }
              />
            ) : null}
          </div>
        </div>
      </HotKeys>
    );
  }

  private getDiffMarkers = (value: number) => {
    const lastStepValue = this.props.content.length;
    const contIndex = value <= lastStepValue ? value - 1 : 0;
    const pathified = this.props.content[contIndex];
    const redexed = pathified.code;
    const redex = pathified.redex.split('\n');

    const diffMarkers = [] as any[];
    if (redex.length > 0) {
      const mainprog = redexed.split('$');
      let text = mainprog[0];
      let front = text.split('\n');

      let startR = front.length - 1;
      let startC = front[startR].length;

      for (let i = 0; i < mainprog.length - 1; i++) {
        const endR = startR + redex.length - 1;
        const endC =
          redex.length === 1
            ? startC + redex[redex.length - 1].length
            : redex[redex.length - 1].length;

        diffMarkers.push({
          startRow: startR,
          startCol: startC,
          endRow: endR,
          endCol: endC,
          className: value % 2 === 0 ? 'beforeMarker' : 'afterMarker',
          type: 'background'
        });

        text = text + redex + mainprog[i + 1];
        front = text.split('\n');
        startR = front.length - 1;
        startC = front[startR].length;
      }
    }
    return diffMarkers;
  };

  private getText(value: number) {
    const lastStepValue = this.props.content.length;
    const contIndex = value <= lastStepValue ? value - 1 : 0;
    const pathified = this.props.content[contIndex];
    const redexed = pathified.code;
    const redex = pathified.redex;
    const split = pathified.code.split('$');
    if (split.length > 1) {
      let text = split[0];
      for (let i = 1; i < split.length; i++) {
        text = text + redex + split[i];
      }
      return text;
    } else {
      return redexed;
    }
  }

  private sliderShift = (newValue: number) => {
    this.setState((state: State) => {
      return { value: newValue };
    });
  };

  private stepFirst = () => {
    // Move to the first step
    this.sliderShift(1);
  };

  private stepLast = (lastStepValue: number) => () => {
    // Move to the last step
    this.sliderShift(lastStepValue);
  };

  private stepPrevious = () => {
    this.sliderShift(this.state.value - 1);
  };

  private stepNext = () => {
    this.sliderShift(this.state.value + 1);
  };

  private stepPreviousFunctionCall = (value: number) => () => {
    const previousFunctionCall = this.getPreviousFunctionCall(value);
    if (previousFunctionCall !== null) {
      this.sliderShift(previousFunctionCall);
    } else {
      this.sliderShift(value);
    }
  };

  private stepNextFunctionCall = (value: number) => () => {
    const nextFunctionCall = this.getNextFunctionCall(value);
    if (nextFunctionCall !== null) {
      this.sliderShift(nextFunctionCall);
    } else {
      this.sliderShift(value);
    }
  };

  private hasNextFunctionCall = (value: number) => {
    const lastStepValue = this.props.content.length;
    const contIndex = value <= lastStepValue ? value - 1 : 0;
    const currentFunction = this.props.content[contIndex].function;
    if (currentFunction === undefined) {
      return false;
    } else {
      for (let i = contIndex + 1; i < this.props.content.length; i++) {
        const nextFunction = this.props.content[i].function;
        if (nextFunction === currentFunction) {
          return true;
        } else if (nextFunction !== undefined) {
          if (isEqual(currentFunction, nextFunction)) {
            return true;
          }
        }
      }
      return false;
    }
  };

  private hasPreviousFunctionCall = (value: number) => {
    const lastStepValue = this.props.content.length;
    const contIndex = value <= lastStepValue ? value - 1 : 0;
    const currentFunction = this.props.content[contIndex].function;
    if (currentFunction === undefined) {
      return false;
    } else {
      for (let i = contIndex - 1; i > -1; i--) {
        const nextFunction = this.props.content[i].function;
        if (nextFunction === currentFunction) {
          return true;
        } else if (nextFunction !== undefined) {
          if (isEqual(currentFunction, nextFunction)) {
            return true;
          }
        }
      }
      return false;
    }
  };

  private getPreviousFunctionCall = (value: number) => {
    const lastStepValue = this.props.content.length;
    const contIndex = value <= lastStepValue ? value - 1 : 0;
    const currentFunction = this.props.content[contIndex].function;
    if (currentFunction === undefined) {
      return null;
    }
    for (let i = contIndex - 1; i > -1; i--) {
      const nextFunction = this.props.content[i].function;
      if (nextFunction === currentFunction) {
        return i + 1;
      } else if (nextFunction !== undefined) {
        if (isEqual(currentFunction, nextFunction)) {
          return i + 1;
        }
      }
    }
    return null;
  };

  private getNextFunctionCall = (value: number) => {
    const lastStepValue = this.props.content.length;
    const contIndex = value <= lastStepValue ? value - 1 : 0;
    const currentFunction = this.props.content[contIndex].function;
    if (currentFunction === undefined) {
      return null;
    }
    for (let i = contIndex + 1; i < this.props.content.length; i++) {
      const nextFunction = this.props.content[i].function;
      if (nextFunction === currentFunction) {
        return i + 1;
      } else if (nextFunction !== undefined) {
        if (isEqual(currentFunction, nextFunction)) {
          return i + 1;
        }
      }
    }
    return null;
  };
}

export default SideContentSubstVisualizer;
