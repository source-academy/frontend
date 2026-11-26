/**
 * The instructions and the program parts that the CSE machine's control holds, as the renderer
 * knows them: a copy of the vocabulary of js-slang's `cse-machine/types` (the `InstrType` values are
 * the ones that evaluators send as `metadata.instrType` in a snapshot, which is how an evaluator of
 * any language says which instruction a control item is), on the ESTree node types.
 *
 * It is a copy so that the renderer does not depend on js-slang, which a plugin cannot bundle;
 * js-slang's own instructions and nodes, which the layout tests still run real programs to get, are
 * accepted wherever one of these is.
 */
import type es from 'estree';

import type { Environment } from './CseRenderTypes';

/**
 * A sequence of statements not surrounded by braces: not a block, so evaluating it does not make an
 * environment. ESTree has no such node, js-slang defines it.
 */
export type StatementSequence = es.BaseStatement & {
  type: 'StatementSequence';
  body: Array<es.Statement>;
  innerComments?: Array<es.Comment> | undefined;
};

/** A node of the program: ESTree's, and the sequence of statements. */
export type Node = {
  isEnvDependent?: boolean;
} & (
  | es.Node
  | StatementSequence
  | es.MaybeNamedClassDeclaration
  | es.MaybeNamedFunctionDeclaration
);

export enum InstrType {
  RESET = 'Reset',
  WHILE = 'While',
  FOR = 'For',
  ASSIGNMENT = 'Assignment',
  UNARY_OP = 'UnaryOperation',
  BINARY_OP = 'BinaryOperation',
  POP = 'Pop',
  APPLICATION = 'Application',
  BRANCH = 'Branch',
  ENVIRONMENT = 'Environment',
  ARRAY_LITERAL = 'ArrayLiteral',
  ARRAY_ACCESS = 'ArrayAccess',
  ARRAY_ASSIGNMENT = 'ArrayAssignment',
  ARRAY_LENGTH = 'ArrayLength',
  MARKER = 'Marker',
  CONTINUE = 'Continue',
  CONTINUE_MARKER = 'ContinueMarker',
  BREAK = 'Break',
  BREAK_MARKER = 'BreakMarker',
  SPREAD = 'Spread',
}

type BaseInstr<T extends InstrType = InstrType, U extends Node = Node> = {
  instrType: T;
  srcNode: U;
  isEnvDependent?: boolean;
};

export type WhileInstr = BaseInstr<InstrType.WHILE, es.WhileStatement> & {
  test: es.Expression;
  body: es.Statement;
};

export type ForInstr = BaseInstr<InstrType.FOR, es.ForStatement> & {
  init: es.VariableDeclaration | es.Expression;
  test: es.Expression;
  update: es.Expression;
  body: es.Statement;
};

export type DeclAssmtInstr = BaseInstr<InstrType.ASSIGNMENT, es.VariableDeclaration> & {
  symbol: string;
  constant: boolean;
  declaration: true;
};

export type RegularAssmtInstr = BaseInstr<InstrType.ASSIGNMENT, es.AssignmentExpression> & {
  declaration: false;
  symbol: string;
};

export type AssmtInstr = DeclAssmtInstr | RegularAssmtInstr;

export type UnOpInstr = BaseInstr<InstrType.UNARY_OP, es.UnaryExpression> & {
  symbol: es.UnaryOperator;
};

export type BinOpInstr = BaseInstr<InstrType.BINARY_OP, es.BinaryExpression> & {
  symbol: es.BinaryOperator;
};

export type AppInstr = BaseInstr<InstrType.APPLICATION, es.CallExpression> & {
  numOfArgs: number;
};

export type BranchInstr = BaseInstr<InstrType.BRANCH> & {
  consequent: es.Expression | es.Statement;
  alternate: es.Expression | es.Statement | null | undefined;
};

export type EnvInstr = BaseInstr<InstrType.ENVIRONMENT> & {
  env: Environment;
};

export type ArrLitInstr = BaseInstr<InstrType.ARRAY_LITERAL> & {
  arity: number;
};

export type Instr =
  | AppInstr
  | ArrLitInstr
  | AssmtInstr
  | BaseInstr
  | BinOpInstr
  | BranchInstr
  | EnvInstr
  | ForInstr
  | UnOpInstr
  | WhileInstr;

/** An item of the control: a part of the program that is still to be evaluated, or an instruction. */
export type ControlItem = (Node | Instr) & {
  isEnvDependent?: boolean;
};
