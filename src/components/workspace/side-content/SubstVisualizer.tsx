import { Card, Classes, Divider, Pre, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import AceEditor from 'react-ace';
import { HotKeys } from 'react-hotkeys';

import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import 'js-slang/dist/editors/ace/theme/source';

import { controlButton } from '../../commons';

export interface ISubstVisualizerProps {
  content: Array<[string, string, string]>;
}

export interface ISubstVisualizerState {
  value: number;
}

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
        in yellow. On odd-numbered steps, the result of the evaluation is highlighted in green.
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

class SubstVisualizer extends React.Component<ISubstVisualizerProps, ISubstVisualizerState> {
  constructor(props: ISubstVisualizerProps) {
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
            {hasRunCode ? (
              <AceEditor
                className="react-ace"
                mode="source2"
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
                  this.state.value <= lastStepValue && this.props.content.length > 1
                    ? this.props.content[this.state.value - 1][2]
                    : ''
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
    const redexed = pathified[0];
    const redex = pathified[1].split('\n');

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
    const redexed = pathified[0];
    const redex = pathified[1];
    const split = redexed.split('$');
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
    this.setState((state: ISubstVisualizerState) => {
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
}

export default SubstVisualizer;
