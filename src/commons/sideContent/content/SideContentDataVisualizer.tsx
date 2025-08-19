import { Button, Card, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { HotkeyItem } from '@mantine/hooks';
import { bindActionCreators } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { t } from 'i18next';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { connect, MapDispatchToProps } from 'react-redux';
import HotKeys from 'src/commons/hotkeys/HotKeys';

import DataVisualizer from '../../../features/dataVisualizer/dataVisualizer';
import { Step } from '../../../features/dataVisualizer/dataVisualizerTypes';
import { Links } from '../../utils/Constants';
import { beginAlertSideContent } from '../SideContentActions';
import { SideContentLocation, SideContentTab, SideContentType } from '../SideContentTypes';
import { ItalicLink } from './SideContentCseMachine';

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
                {/* TODO: i18n */}
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
                {/* TODO: i18n */}
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
            <DataVisualizerDefaultText />
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
  label: t('sideContent:dataVisualizer.label'),
  iconName: IconNames.EYE_OPEN,
  body: <SideContentDataVisualizer workspaceLocation={location} />,
  id: SideContentType.dataVisualizer
});

const DataVisualizerDefaultText: React.FC = () => {
  const { t } = useTranslation('sideContent', { keyPrefix: 'dataVisualizer' });
  return (
    <p id="data-visualizer-default-text" className={Classes.RUNNING_TEXT}>
      {t('defaultText')}
      <br />
      <br />
      <Trans
        ns="sideContent"
        i18nKey="dataVisualizer.instructions"
        components={[
          <code>
            draw_data(x<sub>1</sub>, x<sub>2</sub>, ... x<sub>n</sub>)
          </code>,
          <code>
            x<sub>k</sub>
          </code>,
          <code>
            k<sup>th</sup>
          </code>,
          <code>n</code>
        ]}
      />
      <br />
      <br />
      <Trans
        ns="sideContent"
        i18nKey="dataVisualizer.reference"
        components={[<ItalicLink href={Links.textbookChapter2_2} />]}
      />
    </p>
  );
};

export default makeDataVisualizerTabFrom;
