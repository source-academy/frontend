import 'js-slang/dist/editors/ace/theme/source';

import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Divider,
  Icon,
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
import { StepperArrowFunctionExpression } from 'js-slang/dist/stepper/stepperV2/nodes/Expression/ArrowFunctionExpression';
import { StepperConditionalExpression } from 'js-slang/dist/stepper/stepperV2/nodes/Expression/ConditionalExpression';
import { StepperFunctionApplication } from 'js-slang/dist/stepper/stepperV2/nodes/Expression/FunctionApplication';
import { StepperExpression } from 'js-slang/dist/stepper/stepperV2/nodes';
import { StepperIfStatement } from 'js-slang/dist/stepper/stepperV2/nodes/Statement/IfStatement';
import { StepperReturnStatement } from 'js-slang/dist/stepper/stepperV2/nodes/Statement/ReturnStatement';
import { astToString } from 'js-slang/dist/utils/ast/astToString';

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
      if (markers === undefined || markers[0] === undefined) {
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
function composeStyleWrapper(first: StyleWrapper | undefined, second: StyleWrapper | undefined): StyleWrapper | undefined {
  if (first === undefined && second === undefined) {
    return undefined;
  } else if (first === undefined) {
    return second;
  } else if (second === undefined) {
    return first;
  }

  return (node: StepperBaseNode) => (rawStyle: React.ReactNode) => {
    const immediateStyle = first(node)(rawStyle);
    return second(node)(immediateStyle);
  }
}

type StyleWrapper = (node: StepperBaseNode) => (rawStyle: React.ReactNode) => React.ReactNode;
function CustomASTRenderer(props: IStepperPropContents): React.ReactNode {
  function markerStyleWrapper(node: StepperBaseNode) {
    return (renderNode: React.ReactNode) => {
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
    }
  }
  function renderNode(
    currentNode: StepperBaseNode,
    parentNode?: StepperBaseNode,
    isRight?: boolean,
    styleWrapper?: StyleWrapper
  ): React.ReactNode {
    const renderArguments = (nodes: StepperExpression[]) => {
      const args: React.ReactNode[] = nodes.map(arg =>
        renderNode(arg, undefined, undefined, styleWrapper)
      );
      var renderedArguments = args.slice(1).reduce(
        (result, item) => (
          <span>
            {result}
            {', '}
            {item}
          </span>
        ),
        args[0]
      );
      renderedArguments = (
        <span>
          {'('}
          {renderedArguments}
          {')'}
        </span>
      );
      return renderedArguments;
    };

    const renderFunctionArguments = (nodes: StepperExpression[]) => {
      const args: React.ReactNode[] = nodes.map(arg =>
        renderNode(arg, undefined, undefined, styleWrapper)
      );
      var renderedArguments = args.slice(1).reduce(
        (result, item) => (
          <span>
            {result}
            {', '}
            {item}
          </span>
        ),
        args[0]
      );
      if (args.length !== 1) {
        renderedArguments = (
          <span>
            {'('}
            {renderedArguments}
            {')'}
          </span>
        );
      }
      return renderedArguments;
    };

    const renderers = {
      Literal(node: StepperLiteral) {
        return <span className="stepper-literal">{node.value?.toString()}</span>;
      },
      Identifier(node: StepperIdentifier) {
        return <span>{node.name}</span>;
      },
      UnaryExpression(node: StepperUnaryExpression) {
        return (
          <span>
            <span className="stepper-operator">{` ${node.operator}`}</span>
            {renderNode(node.argument, node, undefined, styleWrapper)}
          </span>
        );
      },
      BinaryExpression(node: StepperBinaryExpression) {
        return (
          <span>
            {renderNode(node.left, node, false, styleWrapper)}
            <span className="stepper-operator">{` ${node.operator} `}</span>
            {renderNode(node.right, node, true, styleWrapper)}
          </span>
        );
      },
      ConditionalExpression(node: StepperConditionalExpression) {
        return (
          <span>
            {renderNode(node.test, node, undefined, styleWrapper)}
            <span className="stepper-operator">{` ? `}</span>
            {renderNode(node.consequent, node, undefined, styleWrapper)}
            <span className="stepper-operator">{` : `}</span>
            {renderNode(node.alternate, node, undefined, styleWrapper)}
          </span>
        );
      },
      ArrowFunctionExpression(node: StepperArrowFunctionExpression) {
        function muTermStyleWrapper(targetNode: StepperBaseNode) {
          if (targetNode.type === 'Identifier') {
            if ((targetNode as StepperIdentifier).name === node.name) {
              const reference = astToString(node);
              return (styledNode: React.ReactNode) => (
                <span className="stepper-mu-term">
                  <Popover
                    interactionKind="hover"
                    placement="bottom"
                    content={
                      <div>
                        <Icon icon="code" />
                        <span>{' Function definition'}</span>
                        <pre className="bp5-code-block">
                          <code>{reference}</code>
                        </pre>
                      </div>
                    }
                  >
                    {styledNode}
                  </Popover>
                </span>
              );
            }
          }
          return (styledNode: React.ReactNode) => styledNode;
        }
        return (
          <span>
            {renderFunctionArguments(node.params)}
            <span className="stepper-identifier">{' => '}</span>
            {renderNode(node.body, undefined, undefined, composeStyleWrapper(styleWrapper, muTermStyleWrapper))}
          </span>
        );
      },
      CallExpression(node: StepperFunctionApplication) {
        var renderedCallee = renderNode(node.callee, undefined, undefined, styleWrapper);
        if (node.callee.type !== 'Identifier') {
          renderedCallee = (
            <span>
              {'('}
              {renderedCallee}
              {')'}
            </span>
          );
        }
        return (
          <span>
            {renderedCallee}
            {renderArguments(node.arguments)}
          </span>
        );
      },
      Program(node: StepperProgram) {
        return (
          <span>
            {node.body.map(ast => (
              <div>{renderNode(ast, node, undefined, styleWrapper)}</div>
            ))}
          </span>
        );
      },
      IfStatement(node: StepperIfStatement) {
        return <span>{'TO BE IMPLEMENTED'}</span>;
      },
      ReturnStatement(node: StepperReturnStatement) {
        return (
          <span>
            <span className="stepper-operator">{'return '}</span>
            {node.argument && renderNode(node.argument, undefined, undefined, styleWrapper)}
            {';'}
          </span>
        );
      },
      BlockStatement(node: StepperBlockStatement) {
        return (
          <span>
            {'{'}
            {node.body.map(ast => (
              <div style={{ marginLeft: '15px' }}>
                {renderNode(ast, undefined, undefined, styleWrapper)}
              </div>
            ))}
            {'}'}
          </span>
        );
      },
      ExpressionStatement(node: StepperExpressionStatement) {
        return (
          <span>
            {renderNode(node.expression, undefined, undefined, styleWrapper)}
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
                {renderNode(ast, undefined, undefined, styleWrapper)}
              </span>
            ))}
            {';'}
          </span>
        );
      },
      VariableDeclarator(node: StepperVariableDeclarator) {
        return (
          <span>
            {renderNode(node.id, undefined, undefined, styleWrapper)}
            {' = '}
            {node.init ? renderNode(node.init, undefined, undefined, styleWrapper) : 'undefined'}
          </span>
        );
      }
    };

    // @ts-ignore
    const renderer = renderers[currentNode.type];
    const isParenthesis = expressionNeedsParenthesis(currentNode, parentNode, isRight);
    var result = renderer ? renderer(currentNode) : `<${currentNode.type}>`;
    if (isParenthesis) {
      result = (
        <span>
          {'('}
          {result}
          {')'}
        </span>
      );
    }
    // custom wrapper style
    if (styleWrapper) {
      result = styleWrapper(currentNode)(result);
    }
    return result;
  }
  const getDisplayedNode = useCallback((): React.ReactNode => {
    return renderNode(props.ast, undefined, undefined, markerStyleWrapper);
  }, [props]);
  return <div className="stepper-display">{getDisplayedNode()}</div>;
}

/////////// Parenthesis handling ////////////
const OPERATOR_PRECEDENCE = {
  '||': 2,
  '??': 3,
  '&&': 4,
  '|': 5,
  '^': 6,
  '&': 7,
  '==': 8,
  '!=': 8,
  '===': 8,
  '!==': 8,
  '<': 9,
  '>': 9,
  '<=': 9,
  '>=': 9,
  in: 9,
  instanceof: 9,
  '<<': 10,
  '>>': 10,
  '>>>': 10,
  '+': 11,
  '-': 11,
  '*': 12,
  '%': 12,
  '/': 12,
  '**': 13
};
const NEEDS_PARENTHESES = 17;
const EXPRESSIONS_PRECEDENCE = {
  // Definitions
  ArrayExpression: 20,
  TaggedTemplateExpression: 20,
  ThisExpression: 20,
  Identifier: 20,
  PrivateIdentifier: 20,
  Literal: 18,
  TemplateLiteral: 20,
  Super: 20,
  SequenceExpression: 20,
  // Operations
  MemberExpression: 19,
  ChainExpression: 19,
  CallExpression: 19,
  NewExpression: 19,
  // Other definitions
  ArrowFunctionExpression: NEEDS_PARENTHESES,
  ClassExpression: NEEDS_PARENTHESES,
  FunctionExpression: NEEDS_PARENTHESES,
  ObjectExpression: NEEDS_PARENTHESES,
  // Other operations
  UpdateExpression: 16,
  UnaryExpression: 15,
  AwaitExpression: 15,
  BinaryExpression: 14,
  LogicalExpression: 13,
  ConditionalExpression: 4,
  AssignmentExpression: 3,
  YieldExpression: 2,
  RestElement: 1
};

// Inspired by astring
function expressionNeedsParenthesis(
  node: StepperBaseNode,
  parentNode?: StepperBaseNode,
  isRightHand?: boolean
) {
  if (parentNode === undefined) {
    return false;
  }

  const nodePrecedence = EXPRESSIONS_PRECEDENCE[node.type as keyof typeof EXPRESSIONS_PRECEDENCE];
  if (nodePrecedence === NEEDS_PARENTHESES) {
    return true;
  }
  const parentNodePrecedence =
    EXPRESSIONS_PRECEDENCE[parentNode.type as keyof typeof EXPRESSIONS_PRECEDENCE];
  if (nodePrecedence === undefined || parentNodePrecedence === undefined) {
    return false;
  }

  if (nodePrecedence !== parentNodePrecedence) {
    return (
      (!isRightHand && nodePrecedence === 15 && parentNodePrecedence === 14) ||
      nodePrecedence < parentNodePrecedence
    );
  }

  if (!('operator' in node) || !('operator' in parentNode)) {
    return false;
  }

  if (nodePrecedence !== 13 && nodePrecedence !== 14) {
    // Not a `LogicalExpression` or `BinaryExpression`
    return false;
  }
  if (node.operator === '**' && parentNode.operator === '**') {
    // Exponentiation operator has right-to-left associativity
    return !isRightHand;
  }
  if (
    nodePrecedence === 13 &&
    parentNodePrecedence === 13 &&
    (node.operator === '??' || parentNode.operator === '??')
  ) {
    return true;
  }

  const nodeOperatorPrecedence =
    OPERATOR_PRECEDENCE[node.operator as keyof typeof OPERATOR_PRECEDENCE];
  const parentNodeOperatorPrecedence =
    OPERATOR_PRECEDENCE[parentNode.operator as keyof typeof OPERATOR_PRECEDENCE];
  return isRightHand
    ? nodeOperatorPrecedence <= parentNodeOperatorPrecedence
    : nodeOperatorPrecedence <= parentNodeOperatorPrecedence;
}

export default SideContentSubstVisualizer;
