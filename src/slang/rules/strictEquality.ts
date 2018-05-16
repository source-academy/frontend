import * as es from 'estree'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class StrictEqualityError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR

  constructor(public node: es.BinaryExpression) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    if (this.node.operator === '==') {
      return 'Use === instead of =='
    } else {
      return 'Use !== instead of !='
    }
  }

  elaborate() {
    return '== and != is not a valid operator'
  }
}

const strictEquality: Rule<es.BinaryExpression> = {
  name: 'strict-equality',

  checkers: {
    BinaryExpression(node: es.BinaryExpression) {
      if (node.operator === '==' || node.operator === '!=') {
        return [new StrictEqualityError(node)]
      } else {
        return []
      }
    }
  }
}

export default strictEquality
