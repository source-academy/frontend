import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

const mutableDeclarators = ['let', 'var']

export class NoDeclareMutableError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR

  constructor(public node: es.VariableDeclaration) {}

  get location() {
    return this.node.loc!
  }

  public explain() {
    return (
      'Mutable variable declaration using keyword ' + `'${this.node.kind}'` + ' is not allowed.'
    )
  }

  public elaborate() {
    return this.explain()
  }
}

const noDeclareMutable: Rule<es.VariableDeclaration> = {
  name: 'no-declare-mutable',

  checkers: {
    VariableDeclaration(node: es.VariableDeclaration) {
      if (mutableDeclarators.includes(node.kind)) {
        return [new NoDeclareMutableError(node)]
      } else {
        return []
      }
    }
  }
}

export default noDeclareMutable
