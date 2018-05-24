const syntaxTypes: { [nodeName: string]: number } = {
  // Chapter 1
  Program: 1,
  ExpressionStatement: 1,
  IfStatement: 1,
  FunctionDeclaration: 1,
  VariableDeclaration: 1,
  ReturnStatement: 1,
  CallExpression: 1,
  UnaryExpression: 1,
  BinaryExpression: 1,
  LogicalExpression: 1,
  ConditionalExpression: 1,
  FunctionExpression: 1,
  ArrowFunctionExpression: 1,
  Identifier: 1,
  Literal: 1,

  // Week 5
  EmptyStatement: 5,
  ArrayExpression: 5,

  // Week 8
  AssignmentExpression: 8,
  WhileStatement: 8,

  // Week 9
  ForStatement: 9,
  BreakStatement: 9,
  ContinueStatement: 9,
  MemberExpression: 9,

  // Week 10
  ThisExpression: 10,
  ObjectExpression: 10,
  Property: 10,
  UpdateExpression: 10,
  NewExpression: 10,

  // Disallowed Forever
  SwitchStatement: Infinity,
  DebuggerStatement: Infinity,
  WithStatement: Infinity,
  LabeledStatement: Infinity,
  SwitchCase: Infinity,
  ThrowStatement: Infinity,
  CatchClause: Infinity,
  DoWhileStatement: Infinity,
  ForInStatement: Infinity,
  SequenceExpression: Infinity
}

export default syntaxTypes
