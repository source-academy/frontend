import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

export class NoNonEmptyListError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR

  constructor(public node: es.ArrayExpression) {}

  get location() {
    return this.node.loc!
  }

  public explain() {
    return 'Only empty list notation ([]) is allowed'
  }

  public elaborate() {
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
