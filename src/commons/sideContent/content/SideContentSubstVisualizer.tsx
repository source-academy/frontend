import 'js-slang/dist/editors/ace/theme/source';

import { Button, ButtonGroup, Card, Classes, Divider, Pre, Slider } from '@blueprintjs/core';
import { getHotkeyHandler, HotkeyItem } from '@mantine/hooks';
import classNames from 'classnames';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { beginAlertSideContent } from '../SideContentActions';
import { SideContentLocation, SideContentType } from '../SideContentTypes';
import { IStepperPropContents } from 'js-slang/dist/stepper/stepperV2';
import { StepperBaseNode } from 'js-slang/dist/stepper/stepperV2/interface';
import { StepperLiteral } from 'js-slang/dist/stepper/stepperV2/nodes/Expression/Literal';
import { StepperUnaryExpression } from 'js-slang/dist/stepper/stepperV2/nodes/Expression/UnaryExpression';
import { StepperBinaryExpression } from 'js-slang/dist/stepper/stepperV2/nodes/Expression/BinaryExpression';
import { StepperProgram } from 'js-slang/dist/stepper/stepperV2/nodes/Program';
import { StepperBlockStatement } from 'js-slang/dist/stepper/stepperV2/nodes/Statement/BlockStatement';
import { StepperIdentifier } from 'js-slang/dist/stepper/stepperV2/nodes/Expression/Identifier';
import { StepperExpressionStatement } from 'js-slang/dist/stepper/stepperV2/nodes/Statement/ExpressionStatement';
import {
  StepperVariableDeclaration,
  StepperVariableDeclarator
} from 'js-slang/dist/stepper/stepperV2/nodes/Statement/VariableDeclaration';

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
  console.log(props);
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
      // Right now, prioritize the first marker
      const markers = props.content[contIndex].markers;
      if (markers === undefined) {
        return '...';
      } else {
        return markers[0].explanation ?? '...';
      }
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
function CustomASTRenderer(props: IStepperPropContents): React.ReactNode {
  function renderNode(node: StepperBaseNode): React.ReactNode {
    const wrapMarkerStyle = (renderNode: React.ReactNode): React.ReactNode => {
      if (props.markers === undefined) {
        return renderNode;
      }
      var returnNode = <span>{renderNode}</span>;
      props.markers.forEach(marker => {
        if (marker.redex === node) {
          returnNode = <span className={marker.redexType}>{returnNode}</span>;
        }
      });
      return returnNode;
    };

    const renderers = {
      Literal(node: StepperLiteral) {
        return <span className="stepper-literal">{node.value}</span>;
      },
      Identifier(node: StepperIdentifier) {
        return <span>{node.name}</span>;
      },
      UnaryExpression(node: StepperUnaryExpression) {
        return (
          <span>
            <span className="stepper-operator">{` ${node.operator}`}</span>
            {renderNode(node.argument)}
          </span>
        );
      },
      BinaryExpression(node: StepperBinaryExpression) {
        // TODO: check precedence
        return (
          <span>
            {renderNode(node.left)}
            <span className="stepper-operator">{` ${node.operator} `}</span>
            {renderNode(node.right)}
          </span>
        );
      },
      Program(node: StepperProgram) {
        return (
          <span>
            {node.body.map(ast => (
              <div>{renderNode(ast)}</div>
            ))}
          </span>
        );
      },
      BlockStatement(node: StepperBlockStatement) {
        return (
          <span>
            {'{'}
            {node.body.map(ast => (
              <div style={{marginLeft: '15px'}}>
                {renderNode(ast)}
              </div>
            ))}
            {'}'}
          </span>
        );
      },
      ExpressionStatement(node: StepperExpressionStatement) {
        return (
          <span>
            {renderNode(node.expression)}
            {';'}
          </span>
        );
      },
      VariableDeclaration(node: StepperVariableDeclaration) {
        return (
          <span>
            <span className="stepper-identifier">{node.kind} </span>
            {node.declarations.map((ast, idx) => (
              <span>
                {idx !== 0 && ', '}
                {renderNode(ast)}
              </span>
            ))}
            {';'}
          </span>
        );
      },
      VariableDeclarator(node: StepperVariableDeclarator) {
        return (
          <span>
            {renderNode(node.id)}
            {' = '}
            {node.init ? renderNode(node.init) : 'undefined'}
          </span>
        );
      }
    };

    // @ts-ignore
    const renderer = renderers[node.type];
    return renderer ? wrapMarkerStyle(renderer(node)) : '...';
  }
  const getDisplayedNode = useCallback((): React.ReactNode => {
    return renderNode(props.ast);
  }, [props]);
  return <div className="stepper-display">{getDisplayedNode()}</div>;
}

export default SideContentSubstVisualizer;
