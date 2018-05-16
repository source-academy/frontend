import * as es from 'estree'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

const mutableDeclarators = ['let', 'var']

export class noDeclareMutableError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR

  constructor(public node: es.VariableDeclaration) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return (
      'Mutable variable declaration using keyword ' +
      `'${this.node.kind}'` +
      ' is not allowed.'
    )
  }

  elaborate() {
    return this.explain()
  }
}

const noDeclareMutable: Rule<es.VariableDeclaration> = {
  name: 'no-declare-mutable',

  checkers: {
    VariableDeclaration(node: es.VariableDeclaration) {
      if (mutableDeclarators.includes(node.kind)) {
        return [new noDeclareMutableError(node)]
      } else {
        return []
      }
    }
  }
}

export default noDeclareMutable
