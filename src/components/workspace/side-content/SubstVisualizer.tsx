import { Classes, Divider, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as es from 'estree';
import { codify } from 'js-slang/dist/stepper/stepper';
import * as React from 'react';
import AceEditor from 'react-ace';
import { HotKeys } from 'react-hotkeys';

import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import 'js-slang/dist/editors/ace/theme/source';

import { controlButton } from '../../commons';

export interface ISubstVisualizerProps {
  content: es.Program[];
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
        On this tab, the REPL will be hidden from view. You may use this tool by writing your
        program on the left, then dragging the slider above to see its evaluation.
        <br />
        <br />
        Alternatively, you may click on the gutter of the editor (where all the line numbers are, on
        the left) to set a breakpoint, and then run the program to show it here!
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
        Note that first and last step shortcuts are only active when the browser focus is on this
        panel (click on the slider or the text!).
        <br />
        <br />
        When focus is on the slider, the arrow keys may also be used to move a single step.
      </div>
    </div>
  );
};

const substKeyMap = {
  FIRST_STEP: ',',
  LAST_STEP: '.'
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
                value={codify(
                  this.props.content[this.state.value <= lastStepValue ? this.state.value - 1 : 0]
                )}
                setOptions={{
                  fontFamily: "'Inconsolata', 'Consolas', monospace"
                }}
              />
            ) : (
              <SubstDefaultText />
            )}
          </div>
        </div>
      </HotKeys>
    );
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
