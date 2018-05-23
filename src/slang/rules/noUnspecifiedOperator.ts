import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

export class NoUnspecifiedOperatorError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public unspecifiedOperator: string

  constructor(public node: es.BinaryExpression | es.UnaryExpression) {
    this.unspecifiedOperator = node.operator
  }

  get location() {
    return this.node.loc!
  }

  public explain() {
    return `Unspecified operator '${this.unspecifiedOperator}' used.`
  }

  public elaborate() {
    return this.explain()
  }
}

const noUnspecifiedOperator: Rule<es.BinaryExpression | es.UnaryExpression> = {
  name: 'no-unspecified-operator',

  checkers: {
    BinaryExpression(node: es.BinaryExpression) {
      const unspecifiedOperators = [
        '==',
        '!=',
        '<<',
        '>>',
        '>>>',
        '**',
        '|',
        '^',
        '&',
        'in',
        'instanceof'
      ]
      if (unspecifiedOperators.filter(op => op === node.operator).length > 0) {
        return [new NoUnspecifiedOperatorError(node)]
      } else {
        return []
      }
    },
    UnaryExpression(node: es.UnaryExpression) {
      const unspecifiedOperators = ['~', 'typeof', 'void', 'delete']
      if (unspecifiedOperators.filter(op => op === node.operator).length > 0) {
        return [new NoUnspecifiedOperatorError(node)]
      } else {
        return []
      }
    }
  }
}

export default noUnspecifiedOperator
