import * as es from 'estree'
import { Context, ErrorSeverity, ErrorType, SourceError, Value } from '../types'

class TypeError implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(node: es.Node, public side: string, public expected: string, public got: string) {
    this.location = node.loc!
  }

  public explain() {
    return `Expected ${this.expected}${this.side}, got ${this.got}.`
  }

  public elaborate() {
    return 'TODO'
  }
}

const isNumber = (v: Value) => typeof v === 'number'
const isString = (v: Value) => typeof v === 'string'
const isBool = (v: Value) => typeof v === 'boolean'
// const isAny = (v: Value) => true

const checkAdditionAndComparison = (context: Context, left: Value, right: Value) => {
  if (!(isNumber(left) || isString(left))) {
    return new TypeError(
      context.runtime.nodes[0],
      ' in left hand side of operation',
      'number or string',
      typeof left
    )
  }
  if (!(isNumber(right) || isString(right))) {
    return new TypeError(
      context.runtime.nodes[0],
      ' in right hand side of operation',
      'number or string',
      typeof right
    )
  }
  return
}

const checkBinaryArithmetic = (context: Context, left: Value, right: Value) => {
  if (!isNumber(left)) {
    return new TypeError(
      context.runtime.nodes[0],
      ' in left hand side of operation',
      'number',
      typeof left
    )
  }
  if (!isNumber(left)) {
    return new TypeError(
      context.runtime.nodes[0],
      ' in right hand side of operation',
      'number',
      typeof right
    )
  }
  return
}

export const checkUnaryExpression = (
  context: Context,
  operator: es.UnaryOperator,
  value: Value
) => {
  const node = context.runtime.nodes[0]
  switch (operator) {
    case '+':
      return isNumber(value) ? undefined : new TypeError(node, '', 'number', typeof value)
    case '-':
      return isNumber(value) ? undefined : new TypeError(node, '', 'number', typeof value)
    case '!':
      return isBool(value) ? undefined : new TypeError(node, '', 'boolean', typeof value)
    default:
      return
  }
}

export const checkBinaryExpression = (
  context: Context,
  operator: es.BinaryOperator,
  left: Value,
  right: Value
) => {
  switch (operator) {
    case '-':
    case '*':
    case '/':
    case '%':
      return checkBinaryArithmetic(context, left, right)
    case '<':
    case '<=':
    case '>':
    case '>=':
    case '+':
      return checkAdditionAndComparison(context, left, right)
    case '!==':
    case '===':
    default:
      return
  }
}
