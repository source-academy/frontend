import * as es from 'estree'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class BracesAroundWhileError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR

  constructor(public node: es.WhileStatement) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return 'Missing curly braces around "while" block'
  }

  elaborate() {
    return 'TODO'
  }
}

const bracesAroundWhile: Rule<es.WhileStatement> = {
  name: 'braces-around-while',

  checkers: {
    WhileStatement(node: es.WhileStatement) {
      if (node.body.type !== 'BlockStatement') {
        return [new BracesAroundWhileError(node)]
      } else {
        return []
      }
    }
  }
}

export default bracesAroundWhile
