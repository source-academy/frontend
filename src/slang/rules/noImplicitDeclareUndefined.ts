import * as es from 'estree'
import { stripIndent } from 'common-tags'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class NoImplicitDeclareUndefinedError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR
  constructor(public node: es.Identifier) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return 'Missing value in variable declaration'
  }

  elaborate() {
    return stripIndent`
      A variable declaration assigns a value to a name.
      For instance, to assign 20 to ${this.node.name}, you can write:

        var ${this.node.name} = 20;

        ${this.node.name} + ${this.node.name}; // 40
    `
  }
}

const noImplicitDeclareUndefined: Rule<es.VariableDeclaration> = {
  name: 'no-implicit-declare-undefined',

  checkers: {
    VariableDeclaration(node: es.VariableDeclaration) {
      const errors: SourceError[] = []
      for (const decl of node.declarations) {
        if (!decl.init) {
          errors.push(
            new NoImplicitDeclareUndefinedError(decl.id as es.Identifier)
          )
        }
      }
      return errors
    }
  }
}

export default noImplicitDeclareUndefined
