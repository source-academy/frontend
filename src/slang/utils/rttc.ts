import * as es from 'estree'
import { SourceError, Value, Context, ErrorSeverity, ErrorType } from '../types'

class TypeError implements SourceError {
  type: ErrorType.RUNTIME
  severity: ErrorSeverity.WARNING
  location: es.SourceLocation

  constructor(node: es.Node, public context: string, public expected: string, public got: string) {
    this.location = node.loc!
  }

  explain() {
    return `TypeError: Expected ${this.expected} in ${this.context}, got ${this.got}.`
  }

  elaborate() {
    return 'TODO'
  }
}

const isNumber = (v: Value) => typeof v === 'number'
const isString = (v: Value) => typeof v === 'string'

const checkAdditionAndComparison = (context: Context, left: Value, right: Value) => {
  if (!(isNumber(left) || isString(left))) {
    context.errors.push(
      new TypeError(
        context.runtime.nodes[0],
        'left hand side of operation',
        'number or string',
        typeof left
      )
    )
  }
  if (!(isNumber(right) || isString(right))) {
    context.errors.push(
      new TypeError(
        context.runtime.nodes[0],
        'right hand side of operation',
        'number or string',
        typeof right
      )
    )
  }
}

const checkBinaryArithmetic = (context: Context, left: Value, right: Value) => {
  if (!isNumber(left)) {
    context.errors.push(
      new TypeError(context.runtime.nodes[0], 'left hand side of operation', 'number', typeof left)
    )
  }
  if (!isNumber(left)) {
    context.errors.push(
      new TypeError(
        context.runtime.nodes[0],
        'right hand side of operation',
        'number',
        typeof right
      )
    )
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
