const DEFAULT_STORY = `---
config:
  chapter: 4
  variant: default

env:
  iterFib:
    chapter: 4
    variant: default
  recuFib:
    chapter: 4
    variant: default
  rune:
    chapter: 4
    variant: default
---

# Stories for Source Academy Quick Start

## Source Blocks

You can create source blocks as follows:

\`\`\`\`
\`\`\`source
const incr_two = (x) => x + 2;
\`\`\`
\`\`\`\`

Will render as:

\`\`\`source
const incr_two = (x) => x + 2;
\`\`\`

Try running the code above!

Subsequent source blocks will continue the evaluation flow. Try running the following source block:

\`\`\`source
incr_two(10);
\`\`\`

You can reset the environment by clicking on the \`Reset Env\` button on the top right of the source block.

## Changing Configs

You can change the chapter and variant of source blocks by adding a header to the top of this markdown file.

\`\`\`
---
config:
  chapter: SOURCE_4
  variant: DEFAULT
---
\`\`\`

The current valid CHAPTER/VARIANT combinations can be found [here](https://github.com/source-academy/js-slang#usage).

## Adding New Environments

Sometimes, you may want a different evaluation flow for source blocks. Consider these two implementations of the fibonacci function:
### Iterative Fib

\`\`\`source-env:iterFib
function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i = i + 1) {
    const old_b = b;
    b = a + b;
    a = old_b;
  }
  return a;
}
\`\`\`

\`\`\`source-env:iterFib
fib(15);
\`\`\`

### Recursive Fib

\`\`\`source-env:recuFib
function fib(n) {
  return n < 2 ? n : fib(n-1) + fib(n-2);
}
\`\`\`

\`\`\`source-env:recuFib
fib(15);
\`\`\`

It would make sense for these two execution flows to be separated so the functions do not overwrite each other.

This can be done by configuring the code blocks to be from different environments. In the header, we can add

\`\`\`
env:
  iterFib:
    chapter: 4
    variant: default
  recuFib:
    chapter: 4
    variant: default
\`\`\`

to create two different environments. Then, we add \`source-env:iterFib\` and \`source-env:recuFib\` to the parameters of the source blocks to set them to their respective environments!

## Module Support

Stories also supports modules!

\`\`\`source-env:rune
import {show, heart} from 'rune';

show(heart);
\`\`\`
`;

export default DEFAULT_STORY;
