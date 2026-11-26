import { generate, GENERATOR } from 'astring';

/**
 * The source text of a node of the program, as js-slang writes it (a copy of js-slang's
 * `astToString`, so that the renderer does not depend on js-slang): ESTree's generator, with the
 * sequence of statements that ESTree does not have.
 */

/** Writes into `state` the `text` string reindented with the provided `indent`. */
function reindent(state: any, text: string, indent: string, lineEnd: string): void {
  const lines = text.split('\n');
  const end = lines.length - 1;
  state.write(lines[0].trim());
  if (end > 0) {
    state.write(lineEnd);
    for (let i = 1; i < end; i++) {
      state.write(indent + lines[i].trim() + lineEnd);
    }
    state.write(indent + lines[end].trim());
  }
}

/**
 * Writes into `state` the provided list of `comments`, with the given `indent` and `lineEnd`
 * strings. Line comments end with `"\n"` regardless of the value of `lineEnd`. Expects to start on a
 * new unindented line.
 */
function formatComments(state: any, comments: any[], indent: string, lineEnd: string): void {
  const { length } = comments;
  for (let i = 0; i < length; i++) {
    const comment = comments[i];
    state.write(indent);
    if (comment.type[0] === 'L') {
      // Line comment
      state.write('// ' + comment.value.trim() + '\n', comment);
    } else {
      // Block comment
      state.write('/*');
      reindent(state, comment.value, indent, lineEnd);
      state.write('*/' + lineEnd);
    }
  }
}

const sourceGen: any = Object.assign({}, GENERATOR, {
  StatementSequence: function (this: any, node: any, state: any) {
    const indent = state.indent.repeat(state.indentLevel);
    const { lineEnd, writeComments } = state;
    const statements = node.body;
    if (statements != null && statements.length > 0) {
      state.write(lineEnd);
      if (writeComments && node.comments != null) {
        formatComments(state, node.comments, indent, lineEnd);
      }
      const { length } = statements;
      for (let i = 0; i < length; i++) {
        const statement = statements[i];
        if (writeComments && statement.comments != null) {
          formatComments(state, statement.comments, indent, lineEnd);
        }
        state.write(indent);
        this[statement.type](statement, state);
        state.write(lineEnd);
      }
      state.write(indent);
    } else {
      if (writeComments && node.comments != null) {
        state.write(lineEnd);
        formatComments(state, node.comments, indent, lineEnd);
        state.write(indent);
      }
    }
    if (writeComments && node.trailingComments != null) {
      formatComments(state, node.trailingComments, indent, lineEnd);
    }
  },
});

export const astToString = (node: any): string => generate(node, { generator: sourceGen });
