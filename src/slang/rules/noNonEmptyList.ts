import * as es from 'estree'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class NoNonEmptyListError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR

  constructor(public node: es.ArrayExpression) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return 'Only empty list notation ([]) is allowed'
  }

  elaborate() {
    return 'TODO'
  }
}

const noNonEmptyList: Rule<es.ArrayExpression> = {
  name: 'no-non-empty-list',

  disableOn: 9,

  checkers: {
    ArrayExpression(node: es.ArrayExpression) {
      if (node.elements.length > 0) {
        return [new NoNonEmptyListError(node)]
      } else {
        return []
      }
    }
  }
}

export default noNonEmptyList
