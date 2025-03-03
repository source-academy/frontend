import 'js-slang/dist/editors/ace/theme/source';

import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Classes,
  Divider,
  Popover,
  Pre,
  Slider
} from '@blueprintjs/core';
import { getHotkeyHandler, HotkeyItem } from '@mantine/hooks';
import classNames from 'classnames';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { beginAlertSideContent } from '../SideContentActions';
import { SideContentLocation, SideContentType } from '../SideContentTypes';
import { IStepperPropContents, toStringWithMarker } from 'js-slang/dist/stepper/stepperV2';

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
        a: Move to the first step
        <br />
        e: Move to the last step
        <br />
        f: Move to the next step
        <br />
        b: Move to the previous step
        <br />
        <br />
        Note that these shortcuts are only active when the browser focus is on this tab (click on or
        above the explanation text).
      </div>
    </div>
  );
};

const SubstCodeDisplay = (props: { content: string }) => {
  return (
    <Card>
      <Pre className="result-output">{props.content}</Pre>
    </Card>
  );
};

type SubstVisualizerPropsAST = {
  content: IStepperPropContents[];
  workspaceLocation: SideContentLocation;
};

const SideContentSubstVisualizer: React.FC<SubstVisualizerPropsAST> = props => {
  const [stepValue, setStepValue] = useState(1);
  const lastStepValue = props.content.length;
  const hasRunCode = lastStepValue !== 0;
  const dispatch = useDispatch();
  const alertSideContent = useCallback(
    () => dispatch(beginAlertSideContent(SideContentType.substVisualizer, props.workspaceLocation)),
    [props.workspaceLocation, dispatch]
  );
  // set source mode as 2
  useEffect(() => {
    
    HighlightRulesSelector(2);
    ModeSelector(2);
  }, []);

  // reset stepValue when content changes
  useEffect(() => {
    setStepValue(1);
    if (props.content.length > 0) {
      alertSideContent();
    }
  }, [props.content, setStepValue, alertSideContent]);

  const stepFirst = () => setStepValue(1);
  const stepLast = () => setStepValue(lastStepValue);
  const stepPrevious = () => setStepValue(Math.max(1, stepValue - 1));
  const stepNext = () => setStepValue(Math.min(props.content.length, stepValue + 1));

  // Setup hotkey bindings
  const hotkeyBindings: HotkeyItem[] = hasRunCode
    ? [
        ['a', stepFirst],
        ['f', stepNext],
        ['b', stepPrevious],
        ['e', stepLast]
      ]
    : [
        ['a', () => {}],
        ['f', () => {}],
        ['b', () => {}],
        ['e', () => {}]
      ];
  const hotkeyHandler = getHotkeyHandler(hotkeyBindings);

  const getExplanation = useCallback(
    (value: number): string => {
      const contIndex = value <= lastStepValue ? value - 1 : 0;
      return props.content[contIndex][2];
    },
    [lastStepValue, props.content]
  );

  const getAST = useCallback(
    (value: number): IStepperPropContents => {
      const contIndex = value <= lastStepValue ? value - 1 : 0;
      return props.content[contIndex];
    },
    [lastStepValue, props.content]
  );

  return (
    <div
      className={classNames('sa-substituter', Classes.DARK)}
      onKeyDown={hotkeyHandler}
      tabIndex={-1} // tab index necessary to fire keydown events on div element
    >
      <Slider
        disabled={!hasRunCode}
        min={1}
        max={lastStepValue}
        onChange={setStepValue}
        value={stepValue <= lastStepValue ? stepValue : 1}
      />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ButtonGroup>
          <Button disabled={!hasRunCode} icon="double-chevron-left" onClick={stepFirst} />
          <Button
            disabled={!hasRunCode || stepValue === 1}
            icon="chevron-left"
            onClick={stepPrevious}
          />
          <Button
            disabled={!hasRunCode || stepValue === lastStepValue}
            icon="chevron-right"
            onClick={stepNext}
          />
          <Button disabled={!hasRunCode} icon="double-chevron-right" onClick={stepLast} />
        </ButtonGroup>
      </div>{' '}
      <br />
      {hasRunCode ? <CustomASTRenderer {...getAST(stepValue)} /> : <SubstDefaultText />}
      {hasRunCode ? <SubstCodeDisplay content={getExplanation(stepValue)} /> : null}
      <div className="stepper-display">
        <div>Expression stepper </div>
        <div>{'Double arrows << and >> are replaced with stepFirst and stepLast.'}</div>
      </div>
    </div>
  );
};

/////////////////////////////////// Custom AST Renderer for Stepper //////////////////////////////////
// Iterative solution: get marked position for custom markers
// Normally, this will be handled using ACEEditor
function CustomASTRenderer(props: IStepperPropContents) {
  const getStringWithMarker = useCallback(() => {
    return toStringWithMarker(props);
  }, [props]);
  return (
    <div className="stepper-display">
      {getStringWithMarker().map(content => (
        <span className={content['className'] + "Marker"}>{content['text']}</span>
      ))}
    </div>
  );
}

/*
function StepperDisplayer(props: IStepperPropContents) {
  const getNodeType = useCallback(
    (node: StepperExpression): string => {
      if (props[1] === node && props[2] === 'before') {
        return 'beforeMarker';
      }
      if (props[1] === node && props[2] === 'after') {
        return 'afterMarker';
      }
      return '';
    },
    [props]
  );

  // TODO: Move this logic from frontend to js-slang
  const convertNode = useCallback(
    (node: StepperExpression): React.ReactNode => {
      const convertors = {
        Literal(node: StepperLiteral) {
          return <span className="stepper-literal">{node.value}</span>;
        },
        UnaryExpression(node: StepperUnaryExpression) {
          return (
            <span>
              <span className="stepper-operator">{` ${node.operator}`}</span>
              {convertNode(node.argument)}
            </span>
          );
        },
        BinaryExpression(node: StepperBinaryExpression) {
          return (
            <span>
              {convertNode(node.left)}
              <span className="stepper-operator">{` ${node.operator} `}</span>
              {convertNode(node.right)}
            </span>
          );
        }
      };
      const convertor = convertors[node.type];
      // @ts-expect-error node actually has type StepperExpression
      const converted = convertor(node);
      if (getNodeType(node) === '') {
        return <span>{converted}</span>;
      } else {
        return (
          <span className={getNodeType(node)}>
            <Popover
              interactionKind="hover"
              placement="bottom"
              minimal={true}
              content={
                <div className=".bp5-running-text {{.modifier}}">
                  <Callout
                    title={node.type}
                    icon="function"
                    intent={getNodeType(node) === 'beforeMarker' ? 'warning' : 'success'}
                  >
                    <div>
                      <span>{'Contraction rule '}</span>
                      <code className="bp5-code">
                        {getNodeType(node) === 'beforeMarker' ? 'E1 -> E2' : 'finished'}
                      </code>
                    </div>
                  </Callout>
                </div>
              }
            >
              {converted}
            </Popover>
          </span>
        );
      }
    },
    [props, getNodeType]
  );

  const getConvertedNode = useCallback((): React.ReactNode => {
    return convertNode(props[0]);
  }, [props, convertNode]);

  return <div className="stepper-display">{getConvertedNode()}</div>;
}
*/
export default SideContentSubstVisualizer;
