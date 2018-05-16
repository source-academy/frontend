import * as es from 'estree'
import { generate } from 'astring'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class MultipleDeclarationsError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR
  private fixs: es.VariableDeclaration[]

  constructor(public node: es.VariableDeclaration) {
    this.fixs = node.declarations.map(declaration => ({
      type: 'VariableDeclaration' as 'VariableDeclaration',
      kind: 'var' as 'var',
      loc: declaration.loc,
      declarations: [declaration]
    }))
  }

  get location() {
    return this.node.loc!
  }

  explain() {
    return 'Multiple declaration in a single statement'
  }

  elaborate() {
    const fixs = this.fixs.map(n => '\t' + generate(n)).join('\n')
    return (
      'Split the variable declaration into multiple lines as follows\n\n' +
      fixs +
      '\n'
    )
  }
}

const singleVariableDeclaration: Rule<es.VariableDeclaration> = {
  name: 'single-variable-declaration',

  checkers: {
    VariableDeclaration(node: es.VariableDeclaration) {
      if (node.declarations.length > 1) {
        return [new MultipleDeclarationsError(node)]
      } else {
        return []
      }
    }
  }
}

export default singleVariableDeclaration
