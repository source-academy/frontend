import {
  AnchorButton,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Classes,
  Icon,
  Tooltip,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import type { HotkeyItem } from '@mantine/hooks';
import classNames from 'classnames';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import HotKeys from 'src/commons/hotkeys/HotKeys';

import DataVisualizer from '../../../features/dataVisualizer/dataVisualizer';
import type { Step } from '../../../features/dataVisualizer/dataVisualizerTypes';
import { Links } from '../../utils/Constants';
import { beginAlertSideContent } from '../SideContentActions';
import {
  type SideContentLocation,
  type SideContentTab,
  SideContentType,
} from '../SideContentTypes';
import { ItalicLink } from './SideContentCseMachine';

type Props = {
  workspaceLocation: SideContentLocation;
};

function SideContentDataVisualizer({ workspaceLocation }: Props) {
  const dispatch = useDispatch();
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    DataVisualizer.init(steps => {
      if (steps.length > 0) {
        dispatch(beginAlertSideContent(SideContentType.dataVisualizer, workspaceLocation));
      }
      setSteps(steps);
      setCurrentStep(0);
    });
  }, [dispatch, workspaceLocation]);

  const onPrevButtonClick = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const onNextButtonClick = () => {
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
  };

  const onViewModeClick = (prevStep: number) => {
    setCurrentStep(prevStep);
  };

  const step: Step | undefined = steps[currentStep];
  const firstStep = currentStep === 0;
  const finalStep = !steps || currentStep === steps.length - 1;

  const hotkeyBindings: HotkeyItem[] = [
    ['ArrowLeft', onPrevButtonClick],
    ['ArrowRight', onNextButtonClick],
  ];

  return (
    <HotKeys bindings={hotkeyBindings}>
      <div className={classNames('sa-data-visualizer', Classes.DARK)}>
        {steps.length > 1 ? (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Button
              style={{
                position: 'absolute',
                left: 0,
              }}
              size="large"
              variant="outlined"
              icon={IconNames.ARROW_LEFT}
              onClick={onPrevButtonClick}
              disabled={firstStep}
            >
              {/* TODO: i18n */}
              Previous
            </Button>
            <h3 className={Classes.TEXT_LARGE}>
              Call {currentStep + 1}/{steps.length}
            </h3>
            <Button
              style={{
                position: 'absolute',
                right: 0,
              }}
              size="large"
              variant="outlined"
              icon={IconNames.ARROW_RIGHT}
              onClick={onNextButtonClick}
              disabled={finalStep}
            >
              {/* TODO: i18n */}
              Next
            </Button>
          </div>
        ) : null}
        {steps.length > 0 ? (
          <div
            key={step.length} // To ensure the style refreshes if the step length changes
            style={{
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto',
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
        {steps.length > 0 && (
          <>
            <ButtonGroup>
              <Tooltip content="Original View" position="top">
                <AnchorButton
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseUp={() => {
                    DataVisualizer.setMode('normal');
                    DataVisualizer.redraw();
                    onViewModeClick(currentStep);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon icon="grid-view" />
                    <Checkbox
                      checked={DataVisualizer.getNormalMode()}
                      style={{ marginTop: 7 }}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                </AnchorButton>
              </Tooltip>
            </ButtonGroup>

            <Tooltip content="Binary Tree View" position="top">
              <AnchorButton
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 10,
                }}
                onMouseUp={() => {
                  DataVisualizer.setMode('binTree');
                  DataVisualizer.redraw();
                  onViewModeClick(currentStep);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon icon="one-to-many" style={{ transform: 'rotate(90deg)', marginLeft: 6 }} />
                  <Checkbox
                    checked={DataVisualizer.getBinTreeMode()}
                    style={{ marginTop: 7 }}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              </AnchorButton>
            </Tooltip>
            <Tooltip content="General Tree View" position="top">
              <AnchorButton
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 10,
                }}
                onMouseUp={() => {
                  DataVisualizer.setMode('tree');
                  DataVisualizer.redraw();
                  onViewModeClick(currentStep);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon icon="diagram-tree" />
                  <Checkbox
                    checked={DataVisualizer.getTreeMode()}
                    style={{ marginTop: 7 }}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              </AnchorButton>
            </Tooltip>
          </>
        )}
      </div>
    </HotKeys>
  );
}

const makeDataVisualizerTabFrom = (location: SideContentLocation): SideContentTab => ({
  label: t($ => $.dataVisualizer.label, { ns: 'sideContent' }),
  iconName: IconNames.EYE_OPEN,
  body: <SideContentDataVisualizer workspaceLocation={location} />,
  id: SideContentType.dataVisualizer,
});

function DataVisualizerDefaultText() {
  const { t } = useTranslation('sideContent', { keyPrefix: 'dataVisualizer' });
  return (
    <p id="data-visualizer-default-text" className={Classes.RUNNING_TEXT}>
      {t($ => $.defaultText)}
      <br />
      <br />
      <Trans
        ns="sideContent"
        i18nKey={$ => $.dataVisualizer.instructions}
        components={[
          // eslint-disable-next-line react/jsx-key
          <code>
            draw_data(x<sub>1</sub>, x<sub>2</sub>, ... x<sub>n</sub>)
          </code>,
          // eslint-disable-next-line react/jsx-key
          <code>
            x<sub>k</sub>
          </code>,
          // eslint-disable-next-line react/jsx-key
          <code>
            k<sup>th</sup>
          </code>,
          // eslint-disable-next-line react/jsx-key
          <code>n</code>,
        ]}
      />
      <br />
      <br />
      <Trans
        ns="sideContent"
        i18nKey={$ => $.dataVisualizer.reference}
        // eslint-disable-next-line react/jsx-key
        components={[<ItalicLink href={Links.textbookChapter2_2} />]}
      />
    </p>
  );
}

export default makeDataVisualizerTabFrom;
