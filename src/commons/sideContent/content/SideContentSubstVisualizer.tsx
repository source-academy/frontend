import 'js-slang/dist/editors/ace/theme/source';
import '../../../styles/StepperPopover.scss';

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
import { IStepperPropContents } from 'js-slang/dist/tracer';
import { StepperBaseNode } from 'js-slang/dist/tracer/interface';
import { StepperExpression } from 'js-slang/dist/tracer/nodes';
import { StepperArrayExpression } from 'js-slang/dist/tracer/nodes/Expression/ArrayExpression';
import { StepperArrowFunctionExpression } from 'js-slang/dist/tracer/nodes/Expression/ArrowFunctionExpression';
import { StepperBinaryExpression } from 'js-slang/dist/tracer/nodes/Expression/BinaryExpression';
import { StepperConditionalExpression } from 'js-slang/dist/tracer/nodes/Expression/ConditionalExpression';
import { StepperFunctionApplication } from 'js-slang/dist/tracer/nodes/Expression/FunctionApplication';
import { StepperIdentifier } from 'js-slang/dist/tracer/nodes/Expression/Identifier';
import { StepperLiteral } from 'js-slang/dist/tracer/nodes/Expression/Literal';
import { StepperLogicalExpression } from 'js-slang/dist/tracer/nodes/Expression/LogicalExpression';
import { StepperUnaryExpression } from 'js-slang/dist/tracer/nodes/Expression/UnaryExpression';
import { StepperProgram } from 'js-slang/dist/tracer/nodes/Program';
import { StepperBlockStatement } from 'js-slang/dist/tracer/nodes/Statement/BlockStatement';
import { StepperExpressionStatement } from 'js-slang/dist/tracer/nodes/Statement/ExpressionStatement';
import { StepperFunctionDeclaration } from 'js-slang/dist/tracer/nodes/Statement/FunctionDeclaration';
import { StepperIfStatement } from 'js-slang/dist/tracer/nodes/Statement/IfStatement';
import { StepperReturnStatement } from 'js-slang/dist/tracer/nodes/Statement/ReturnStatement';
import {
  StepperVariableDeclaration,
  StepperVariableDeclarator
} from 'js-slang/dist/tracer/nodes/Statement/VariableDeclaration';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { beginAlertSideContent } from '../SideContentActions';
import { SideContentLocation, SideContentType } from '../SideContentTypes';

const SubstDefaultText = () => {
  const { t } = useTranslation('sideContent', { keyPrefix: 'substVisualizer' });
  return (
    <div>
      <div id="substituter-default-text" className={Classes.RUNNING_TEXT}>
        {t('welcome')}
        <br />
        <br />
        {t('instructions')}
        <br />
        <br />
        {t('evaluationSteps')}
        <br />
        <br />
        <Divider />
        {t('shortcutsTitle')}
        <br />
        <br />
        {t('shortcuts.a')}
        <br />
        {t('shortcuts.e')}
        <br />
        {t('shortcuts.f')}
        <br />
        {t('shortcuts.b')}
        <br />
        <br />
        {t('shortcutsNote')}
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
    </div>
  );
};

/*
  Custom AST renderer for Stepper (Inspired by astring library)
  This custom AST renderer utilizing the recursive approach of handling rendering of various StepperNodes by
  using nested <div> and <span>. Unlike React-ace, using our own renderer make our stepper more customizable. For example,
  we can add a code component that is hoverable by using with blueprint tooltip.
*/

/** RenderContext holds relevant information to handle rendering. This will be carried along the recursive renderNode function
 * @params parentNode and isRight are used to dictate whether this node requires parenthesis or not
 * @params  styleWrapper composes the necessary styles being passed.
 */
interface RenderContext {
  parentNode?: StepperBaseNode;
  isRight?: boolean; // specified for binary expression
  styleWrapper: StyleWrapper;
  popoverDepth?: number;
}

/**
  StyleWrapper is a function that returns a styling function based on the node. For example,
  ```tsx
  const wrapLiteral: StyleWrapper = (node) => (preformatted) => node.type === "Literal" ? <div className="stepper-literal">preformatted</div> : preformatted;
  ```
  makes the default result from `renderNode(node)` wrapped with className `stepper-literal` for literal AST.
*/
type StyleWrapper = (node: StepperBaseNode) => (preformatted: React.ReactNode) => React.ReactNode;

// composeStyleWrapper takes two style wrappers and merge its effect together.
function composeStyleWrapper(
  first: StyleWrapper | undefined,
  second: StyleWrapper | undefined
): StyleWrapper | undefined {
  return first === undefined && second === undefined
    ? undefined
    : first === undefined
      ? second
      : second === undefined
        ? first
        : (node: StepperBaseNode) => (preformatted: React.ReactNode) => {
            const afterFirstStyle = first(node)(preformatted);
            return second(node)(afterFirstStyle);
          };
}
/**
 * Recursive Hoverover feature
 * muTermStyleWrapper wraps identifiers in the code body with popover
 */
interface FunctionDefinitionPopoverContentProps {
  node: StepperArrowFunctionExpression;
  styleWrapper: StyleWrapper | undefined;
  popoverDepth: number;
  renderNode: (node: StepperBaseNode, context: RenderContext) => React.ReactNode;
  renderFunctionArguments: (
    nodes: StepperExpression[],
    renderNodeFn: (node: StepperBaseNode, context: RenderContext) => React.ReactNode,
    styleWrapper: StyleWrapper | undefined,
    popoverDepth: number
  ) => React.ReactNode;
}

const FunctionDefinitionPopoverContent: React.FC<FunctionDefinitionPopoverContentProps> = ({
  node,
  styleWrapper,
  popoverDepth,
  renderNode,
  renderFunctionArguments
}) => {
  return (
    <div className={classNames('stepper-popover', Classes.DARK)}>
      <div className="stepper-display">
        <Icon icon="code" />
        <span>{' Function definition'}</span>
        <pre className={Classes.CODE_BLOCK}>
          <code>
            {renderFunctionArguments(node.params, renderNode, styleWrapper, popoverDepth)}
            <span className="stepper-identifier">{' => '}</span>
            {renderNode(node.body, {
              styleWrapper: styleWrapper ?? (_node => p => p),
              popoverDepth: popoverDepth + 1
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};

/**
 * renderNode renders Stepper AST to React ReactNode
 * @param currentNode
 * @param renderContext
 */
function renderNode(currentNode: StepperBaseNode, renderContext: RenderContext): React.ReactNode {
  const styleWrapper = renderContext.styleWrapper;
  const popoverDepth = renderContext.popoverDepth ?? 0;
  const renderers = {
    Literal(node: StepperLiteral) {
      const stringifyLiteralValue = (value: any) =>
        typeof value === 'string' ? '"' + value + '"' : value !== null ? value.toString() : 'null';
      return (
        <span className="stepper-literal">
          {node.raw ? node.raw : stringifyLiteralValue(node.value)}
        </span>
      );
    },
    Identifier(node: StepperIdentifier) {
      return <span>{node.name}</span>;
    },
    // Expressions
    UnaryExpression(node: StepperUnaryExpression) {
      return (
        <span>
          <span className="stepper-operator">{`${node.operator}`}</span>
          {renderNode(node.argument, {
            parentNode: node,
            styleWrapper: styleWrapper,
            popoverDepth: popoverDepth
          })}
        </span>
      );
    },
    BinaryExpression(node: StepperBinaryExpression) {
      return (
        <span>
          {renderNode(node.left, {
            parentNode: node,
            isRight: false,
            styleWrapper: styleWrapper,
            popoverDepth: popoverDepth
          })}
          <span className="stepper-operator">{` ${node.operator} `}</span>
          {renderNode(node.right, {
            parentNode: node,
            isRight: true,
            styleWrapper: styleWrapper,
            popoverDepth: popoverDepth
          })}
        </span>
      );
    },
    LogicalExpression(node: StepperLogicalExpression) {
      return (
        <span>
          {renderNode(node.left, {
            parentNode: node,
            isRight: false,
            styleWrapper: styleWrapper,
            popoverDepth: popoverDepth
          })}
          <span className="stepper-operator">{` ${node.operator} `}</span>
          {renderNode(node.right, {
            parentNode: node,
            isRight: true,
            styleWrapper: styleWrapper,
            popoverDepth: popoverDepth
          })}
        </span>
      );
    },
    ConditionalExpression(node: StepperConditionalExpression) {
      return (
        <span>
          {renderNode(node.test, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
          <span className="stepper-conditional-operator">{` ? `}</span>
          {renderNode(node.consequent, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
          <span className="stepper-conditional-operator">{` : `}</span>
          {renderNode(node.alternate, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
        </span>
      );
    },
    ArrayExpression(node: StepperArrayExpression) {
      // Render all arguments inside an array
      const args: React.ReactNode[] = node.elements
        .filter(arg => arg !== null)
        .map(arg => renderNode(arg, { styleWrapper: styleWrapper, popoverDepth: popoverDepth }));

      const renderedArguments = args.slice(1).reduce(
        (result, item) => (
          <span>
            {result}
            {', '}
            {item}
          </span>
        ),
        args[0]
      );
      return (
        <span>
          {'['}
          {renderedArguments}
          {']'}
        </span>
      );
    },
    ArrowFunctionExpression(node: StepperArrowFunctionExpression) {
      /**
       * Add hovering effect to children nodes only if it is an identifier with the name
       * corresponding to the name of lambda expression
       */
      function muTermStyleWrapper(targetNode: StepperBaseNode) {
        if (
          targetNode.type === 'Identifier' &&
          (targetNode as StepperIdentifier).name === node.name
        ) {
          function addHovering(preprocessed: React.ReactNode): React.ReactNode {
            return (
              <span className="stepper-mu-term">
                <Popover
                  interactionKind="hover"
                  placement="bottom"
                  usePortal={popoverDepth === 0}
                  lazy={true}
                  popoverClassName="stepper-popover"
                  content={
                    <FunctionDefinitionPopoverContent
                      node={node}
                      styleWrapper={composeStyleWrapper(styleWrapper, muTermStyleWrapper)}
                      popoverDepth={popoverDepth}
                      renderNode={renderNode}
                      renderFunctionArguments={renderFunctionArguments}
                    />
                  }
                >
                  {preprocessed}
                </Popover>
              </span>
            );
          }
          return addHovering;
        } else {
          // Do nothing
          return (preprocessed: React.ReactNode) => preprocessed;
        }
      }

      // If the name is specified, render the name and add hovering for the body.
      return node.name ? (
        <span className="stepper-mu-term">
          <Popover
            interactionKind="hover"
            placement="bottom"
            usePortal={popoverDepth === 0}
            lazy={true}
            content={
              <FunctionDefinitionPopoverContent
                node={node}
                styleWrapper={composeStyleWrapper(styleWrapper, muTermStyleWrapper)}
                popoverDepth={popoverDepth}
                renderNode={renderNode}
                renderFunctionArguments={renderFunctionArguments}
              />
            }
          >
            {node.name}
          </Popover>
        </span>
      ) : (
        <span>
          {renderFunctionArguments(node.params, renderNode, styleWrapper, popoverDepth)}
          <span className="stepper-identifier">{' => '}</span>
          {renderNode(node.body, {
            styleWrapper: composeStyleWrapper(styleWrapper, muTermStyleWrapper)!,
            popoverDepth: popoverDepth
          })}
        </span>
      );
    },
    CallExpression(node: StepperFunctionApplication) {
      let renderedCallee = renderNode(node.callee, {
        styleWrapper: styleWrapper,
        popoverDepth: popoverDepth
      });
      if (node.callee.type === 'ArrowFunctionExpression' && node.callee.name === undefined) {
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
          {node.body.map((ast, index) => (
            <div key={index}>
              {renderNode(ast, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
            </div>
          ))}
        </span>
      );
    },
    IfStatement(node: StepperIfStatement) {
      return (
        <span>
          <span>
            <span className="stepper-identifier">{'if '}</span>
            {'('}
            <span>
              {renderNode(node.test, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
            </span>
            {') '}
          </span>
          <span>
            {renderNode(node.consequent, {
              styleWrapper: styleWrapper,
              popoverDepth: popoverDepth
            })}
          </span>
          {node.alternate && (
            <span>
              <span className="stepper-identifier">{' else '}</span>
              {renderNode(node.alternate!, {
                styleWrapper: styleWrapper,
                popoverDepth: popoverDepth
              })}
            </span>
          )}
        </span>
      );
    },
    ReturnStatement(node: StepperReturnStatement) {
      return (
        <span>
          <span className="stepper-operator">{'return '}</span>
          {node.argument &&
            renderNode(node.argument, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
          {';'}
        </span>
      );
    },
    BlockStatement(node: StepperBlockStatement) {
      return (
        <span>
          {'{'}
          {node.body.map((ast, index) => (
            <div key={index} style={{ marginLeft: '15px' }}>
              {renderNode(ast, { styleWrapper, popoverDepth: popoverDepth })}
            </div>
          ))}
          {'}'}
        </span>
      );
    },
    ExpressionStatement(node: StepperExpressionStatement) {
      return (
        <span>
          {renderNode(node.expression, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
          {';'}
        </span>
      );
    },
    FunctionDeclaration(node: StepperFunctionDeclaration) {
      return (
        <span>
          <span className="stepper-identifier">{`function ${node.id.name}`}</span>
          <span>{renderArguments(node.params)}</span>
          <span>
            {' '}
            {renderNode(node.body, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
          </span>
        </span>
      );
    },
    VariableDeclaration(node: StepperVariableDeclaration) {
      return (
        <span>
          <span className="stepper-identifier">{node.kind} </span>
          {node.declarations.map((ast, idx) => (
            <span key={idx}>
              {idx !== 0 && ', '}
              {renderNode(ast, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
            </span>
          ))}
          {';'}
        </span>
      );
    },
    VariableDeclarator(node: StepperVariableDeclarator) {
      return (
        <span>
          {renderNode(node.id, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })}
          {' = '}
          {node.init
            ? renderNode(node.init, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })
            : 'undefined'}
        </span>
      );
    }
  };

  // Additional renderers
  const renderFunctionArguments = (
    nodes: StepperExpression[],
    renderNodeFn: typeof renderNode,
    styleWrapper: StyleWrapper | undefined,
    popoverDepth: number
  ) => {
    const args: React.ReactNode[] = nodes.map(arg =>
      renderNodeFn(arg, {
        styleWrapper: styleWrapper ?? (_node => p => p),
        popoverDepth: popoverDepth
      })
    );
    let renderedArguments = args.slice(1).reduce(
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

  const renderArguments = (nodes: StepperExpression[]) => {
    const args: React.ReactNode[] = nodes.map(arg =>
      renderNode(arg, { styleWrapper: styleWrapper, popoverDepth: popoverDepth })
    );
    let renderedArguments = args.slice(1).reduce(
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

  // Entry point of rendering
  const renderer = renderers[currentNode.type as keyof typeof renderers];
  const isParenthesis = expressionNeedsParenthesis(
    currentNode,
    renderContext.parentNode,
    renderContext.isRight
  );
  let result: React.ReactNode = renderer
    ? // @ts-expect-error All subclasses of stepper base node has its corresponding renderes
      renderer(currentNode)
    : `<${currentNode.type}>`; // For debugging in case some AST renderer has not been implemented yet
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
/////////////////////////////////// Custom AST Renderer for Stepper //////////////////////////////////

/**
 * A React component that handles rendering
 */
function CustomASTRenderer(props: IStepperPropContents): React.ReactNode {
  const getDisplayedNode = useCallback((): React.ReactNode => {
    function markerStyleWrapper(node: StepperBaseNode) {
      return (renderNode: React.ReactNode) => {
        if (props.markers === undefined) {
          return renderNode;
        }
        /**
         * highlight the entire function declaration body
         * if its a function declaration, highlight the entire body
         * else just highlight that line
         */
        let returnNode = <span>{renderNode}</span>;
        props.markers.forEach(marker => {
          if (marker.redex === node) {
            const Wrapper = node.type === 'FunctionDeclaration' ? 'div' : 'span';
            returnNode = <Wrapper className={marker.redexType}>{returnNode}</Wrapper>;
          }
        });
        return returnNode;
      };
    }
    return renderNode(props.ast, {
      styleWrapper: markerStyleWrapper,
      popoverDepth: 0
    });
  }, [props]);
  return <div className="stepper-display">{getDisplayedNode()}</div>;
}

/**
 * expressionNeedsParenthesis
 * checking whether the there should be parentheses wrapped around the node or not
 */
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

export default SideContentSubstVisualizer;
