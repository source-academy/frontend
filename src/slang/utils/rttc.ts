import * as es from 'estree'
import {
  ArrowClosure,
  Closure,
  Context,
  ErrorSeverity,
  ErrorType,
  SourceError,
  Value
} from '../types'

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

/**
 * We need to define our own typeof in order for source functions to be
 * identifed as functions
 */
const typeOf = (v: Value) => {
  if (v instanceof Closure || v instanceof ArrowClosure || typeof v === 'function') {
    return 'function'
  } else {
    return typeof v
  }
}
const isNumber = (v: Value) => typeOf(v) === 'number'
const isString = (v: Value) => typeOf(v) === 'string'
const isBool = (v: Value) => typeOf(v) === 'boolean'
const isFunc = (v: Value) => typeOf(v) === 'function'

export const checkUnaryExpression = (
  context: Context,
  operator: es.UnaryOperator,
  value: Value
) => {
  const node = context.runtime.nodes[0]
  switch (operator) {
    case '+':
      return isNumber(value) ? undefined : new TypeError(node, '', 'number', typeOf(value))
    case '-':
      return isNumber(value) ? undefined : new TypeError(node, '', 'number', typeOf(value))
    case '!':
      return isBool(value) ? undefined : new TypeError(node, '', 'boolean', typeOf(value))
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
        return new TypeError(node, LHS, 'number', typeOf(left))
      } else if (!isNumber(right)) {
        return new TypeError(node, RHS, 'number', typeOf(right))
      } else {
        return
      }
    case '<':
    case '<=':
    case '>':
    case '>=':
      if (isNumber(left)) {
        return isNumber(right) ? undefined : new TypeError(node, RHS, 'number', typeOf(right))
      } else if (isString(left)) {
        return isString(right) ? undefined : new TypeError(node, RHS, 'string', typeOf(right))
      } else {
        return new TypeError(node, LHS, 'string or number', typeOf(left))
      }
    case '+':
      if (isNumber(left)) {
        return isNumber(right) || isString(right)
          ? undefined
          : new TypeError(node, RHS, 'number', typeOf(right))
      } else if (!isString(left) && !isString(right)) {
        // must have at least one side that is a string
        return new TypeError(node, LHS, 'string', typeOf(left))
      } else {
        return
      }
    case '!==':
    case '===':
      if (isNumber(left) && !isNumber(right)) {
        return new TypeError(node, RHS, 'number', typeOf(right))
      } else if (isBool(left) && !isBool(right)) {
        return new TypeError(node, RHS, 'boolean', typeOf(right))
      } else if (isString(left) && !isString(right)) {
        return new TypeError(node, RHS, 'string', typeOf(right))
      } else if (isFunc(left) && !isFunc(right)) {
        return new TypeError(node, RHS, 'function', typeOf(right))
      } else {
        return
      }
    default:
      return
  }
}

export const checkLogicalExpression = (context: Context, left: Value, right: Value) => {
  const node = context.runtime.nodes[0]
  if (!isBool(left)) {
    return new TypeError(node, LHS, 'boolean', typeOf(left))
  } else if (!isBool(right)) {
    return new TypeError(node, RHS, 'boolean', typeOf(right))
  } else {
    return
  }
}
