import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

export class NoBlockArrowFunction implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR

  constructor(public node: es.ArrowFunctionExpression) {}

  get location() {
    return this.node.loc!
  }

  public explain() {
    return 'Function definition expressions may only end with an expression.'
  }

  public elaborate() {
    return this.explain()
  }
}

const noBlockArrowFunction: Rule<es.ArrowFunctionExpression> = {
  name: 'no-block-arrow-function',

  checkers: {
    ArrowFunctionExpression(node: es.ArrowFunctionExpression) {
      if (node.body.type === 'BlockStatement') {
        return [new NoBlockArrowFunction(node)]
      } else {
        return []
      }
    }
  }
}

export default noBlockArrowFunction
