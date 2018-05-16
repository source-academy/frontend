import * as es from 'estree'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class NoBlockArrowFunction implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR
  constructor(public node: es.ArrowFunctionExpression) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return 'Function definition expressions may only end with an expression.'
  }

  elaborate() {
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
