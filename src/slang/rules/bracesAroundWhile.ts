import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

export class BracesAroundWhileError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR

  constructor(public node: es.WhileStatement) {}

  get location() {
    return this.node.loc!
  }

  public explain() {
    return 'Missing curly braces around "while" block'
  }

  public elaborate() {
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
