import { Button, Card, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { HotkeyItem } from '@mantine/hooks';
import { bindActionCreators } from '@reduxjs/toolkit';
import classNames from 'classnames';
import React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import HotKeys from 'src/commons/hotkeys/HotKeys';

import DataVisualizer from '../../../features/dataVisualizer/dataVisualizer';
import { Step } from '../../../features/dataVisualizer/dataVisualizerTypes';
import { Links } from '../../utils/Constants';
import { beginAlertSideContent } from '../SideContentActions';
import { SideContentLocation, SideContentTab, SideContentType } from '../SideContentTypes';

type State = {
  steps: Step[];
  currentStep: number;
};

type OwnProps = {
  workspaceLocation: SideContentLocation;
};

type DispatchProps = {
  alertSideContent: () => void;
};

/**
 * This class is responsible for the visualization of data structures via the
 * data_data function in Source. It adds a listener to the DataVisualizer singleton
 * which updates the steps list via setState whenever new steps are added.
 */
class SideContentDataVisualizerBase extends React.Component<OwnProps & DispatchProps, State> {
  constructor(props: any) {
    super(props);
    this.state = { steps: [], currentStep: 0 };
    DataVisualizer.init(steps => {
      if (this.state.steps.length > 0) {
        //  Blink icon
        this.props.alertSideContent();
      }
      this.setState({ steps, currentStep: 0 });
    });
  }

  public render() {
    const step: Step | undefined = this.state.steps[this.state.currentStep];
    const firstStep: () => boolean = () => this.state.currentStep === 0;
    const finalStep: () => boolean = () =>
      !this.state.steps || this.state.currentStep === this.state.steps.length - 1;

    const hotkeyBindings: HotkeyItem[] = [
      ['ArrowLeft', this.onPrevButtonClick],
      ['ArrowRight', this.onNextButtonClick]
    ];

    return (
      <HotKeys bindings={hotkeyBindings}>
        <div className={classNames('sa-data-visualizer', Classes.DARK)}>
          {this.state.steps.length > 1 ? (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10
              }}
            >
              <Button
                style={{
                  position: 'absolute',
                  left: 0
                }}
                large={true}
                outlined={true}
                icon={IconNames.ARROW_LEFT}
                onClick={this.onPrevButtonClick}
                disabled={firstStep()}
              >
                Previous
              </Button>
              <h3 className={Classes.TEXT_LARGE}>
                Call {this.state.currentStep + 1}/{this.state.steps.length}
              </h3>
              <Button
                style={{
                  position: 'absolute',
                  right: 0
                }}
                large={true}
                outlined={true}
                icon={IconNames.ARROW_RIGHT}
                onClick={this.onNextButtonClick}
                disabled={finalStep()}
              >
                Next
              </Button>
            </div>
          ) : null}
          {this.state.steps.length > 0 ? (
            <div
              key={step.length} // To ensure the style refreshes if the step length changes
              style={{
                display: 'flex',
                flexDirection: 'row',
                overflowX: 'auto'
              }}
            >
              {step?.map((elem, i) => (
                <div key={i} style={{ margin: step.length > 1 ? 0 : '0 auto' }}>
                  {' '}
                  {/* To center element when there is only one */}
                  <Card style={{ background: '#1a2530', padding: 10 }}>
                    {step.length > 1 && (
                      <h5
                        className={classNames(Classes.HEADING, Classes.MONOSPACE_TEXT)}
                        style={{ marginTop: 0, marginBottom: 20, whiteSpace: 'nowrap' }}
                      >
                        Structure {i + 1}
                      </h5>
                    )}
                    {elem}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <p id="data-visualizer-default-text" className={Classes.RUNNING_TEXT}>
              The data visualizer helps you to visualize data structures.
              {this.state.steps}
              <br />
              <br />
              It is activated by calling the function{' '}
              <code>
                draw_data(x<sub>1</sub>, x<sub>2</sub>, ... x<sub>n</sub>)
              </code>
              , where{' '}
              <code>
                x<sub>k</sub>
              </code>{' '}
              would be the{' '}
              <code>
                k<sup>th</sup>
              </code>{' '}
              data structure that you want to visualize and <code>n</code> is the number of
              structures.
              <br />
              <br />
              The data visualizer uses box-and-pointer diagrams, as introduced in{' '}
              <a href={Links.textbookChapter2_2} rel="noopener noreferrer" target="_blank">
                <i>
                  Structure and Interpretation of Computer Programs, JavaScript Edition, Chapter 2,
                  Section 2
                </i>
              </a>
              .
            </p>
          )}
        </div>
      </HotKeys>
    );
  }

  private onPrevButtonClick = () => {
    const firstStep = 0;
    this.setState(state => {
      return { currentStep: Math.max(firstStep, state.currentStep - 1) };
    });
  };

  private onNextButtonClick = () => {
    const finalStep = this.state.steps.length - 1;
    this.setState(state => {
      return { currentStep: Math.min(finalStep, state.currentStep + 1) };
    });
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, props) =>
  bindActionCreators(
    {
      alertSideContent: () =>
        beginAlertSideContent(SideContentType.dataVisualizer, props.workspaceLocation)
    },
    dispatch
  );

export const SideContentDataVisualizer = connect(
  null,
  mapDispatchToProps
)(SideContentDataVisualizerBase);

const makeDataVisualizerTabFrom = (location: SideContentLocation): SideContentTab => ({
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <SideContentDataVisualizer workspaceLocation={location} />,
  id: SideContentType.dataVisualizer
});

export default makeDataVisualizerTabFrom;
