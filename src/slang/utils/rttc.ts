import * as es from 'estree'
import { Context, ErrorSeverity, ErrorType, SourceError, Value } from '../types'

const LHS = ' on left hand side of operation'
const RHS = ' on right hand side of operation'

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
const isFunc = (v: Value) => typeof v === 'function'

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
  const node = context.runtime.nodes[0]
  switch (operator) {
    case '-':
    case '*':
    case '/':
    case '%':
      if (!isNumber(left)) {
        return new TypeError(node, LHS, 'number', typeof left)
      } else if (!isNumber(right)) {
        return new TypeError(node, RHS, 'number', typeof right)
      } else {
        return
      }
    case '<':
    case '<=':
    case '>':
    case '>=':
      if (isNumber(left) && !isNumber(right)) {
        return new TypeError(node, RHS, 'number', typeof right)
      } else if (isString(left) && !isString(right)) {
        return new TypeError(node, RHS, 'string', typeof right)
      } else {
        return new TypeError(node, LHS, 'string or number', typeof left)
      }
    case '+':
      if (isNumber(left) && !isNumber(right)) {
        return new TypeError(node, RHS, 'number', typeof right)
      } else if (!isString(left) || !isString(right)) {
        // must have at least one side that is a string
        return new TypeError(node, LHS, 'string', typeof left)
      } else {
        return
      }
    case '!==':
    case '===':
      if (isNumber(left) && !isNumber(right)) {
        return new TypeError(node, RHS, 'number', typeof right)
      } else if (isBool(left) && !isBool(right)) {
        return new TypeError(node, RHS, 'boolean', typeof right)
      } else if (isString(left) && !isString(right)) {
        return new TypeError(node, RHS, 'string', typeof right)
      } else if (isFunc(left) && !isFunc(right)) {
        return new TypeError(node, RHS, 'function', typeof right)
      } else {
        return
      }
    default:
      return
  }
}
