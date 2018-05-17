import { stripIndent } from 'common-tags'
import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

export class NoImplicitReturnUndefinedError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR

  constructor(public node: es.ReturnStatement) {}

  get location() {
    return this.node.loc!
  }

  public explain() {
    return 'Missing value in return statement'
  }

  public elaborate() {
    return stripIndent`
      This return statement is missing a value.
      For instance, to return the value 42, you can write

        return 42;
    `
  }
}

const noImplicitReturnUndefined: Rule<es.ReturnStatement> = {
  name: 'no-implicit-return-undefined',

  checkers: {
    ReturnStatement(node: es.ReturnStatement) {
      if (!node.argument) {
        return [new NoImplicitReturnUndefinedError(node)]
      } else {
        return []
      }
    }
  }
}

export default noImplicitReturnUndefined
