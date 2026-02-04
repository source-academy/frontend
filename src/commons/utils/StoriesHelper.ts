import { h } from 'hastscript';
import { Nodes as MdastNodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import {
  defaultHandlers,
  Options as MdastToHastConverterOptions,
  toHast
} from 'mdast-util-to-hast';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import { IEditorProps } from 'react-ace';
import rehypeReact from 'rehype-react';
import SourceBlock, { SourceBlockProps } from 'src/features/stories/storiesComponents/SourceBlock';
import { unified } from 'unified';

import { ReplaceTypeAtIndex } from './TypeHelper';

export const defaultStoryContent = `---
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
\`\`\`{source}
const incr_two = (x) => x + 2;
\`\`\`
\`\`\`\`

Will render as:

\`\`\`{source}
const incr_two = (x) => x + 2;
\`\`\`

Try running the code above!

Subsequent source blocks will continue the evaluation flow. Try running the following source block:

\`\`\`{source}
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

\`\`\`{source} env:iterFib
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

\`\`\`{source} env:iterFib
fib(15);
\`\`\`

### Recursive Fib

\`\`\`{source} env:recuFib
function fib(n) {
  return n < 2 ? n : fib(n-1) + fib(n-2);
}
\`\`\`

\`\`\`{source} env:recuFib
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

to create two different environments. Then, we add \`env:iterFib\` and \`env:recuFib\` to the metadata of the source blocks to set them to their respective environments!

## Module Support

Stories also supports modules!

\`\`\`{source} env:rune
import {show, heart} from 'rune';

show(heart);
\`\`\`
`;

export const scrollSync = (editor: IEditorProps, preview: HTMLElement) => {
  const editorScrollTop = editor.session.getScrollTop();
  const editorScrollHeight = editor.renderer.layerConfig.maxHeight;

  const previewScrollH = Math.max(preview.scrollHeight, 1);
  const previewVisibleH = Math.max(preview.offsetHeight, 1);

  const relativeHeight =
    (editorScrollTop / (editorScrollHeight - previewVisibleH)) * (previewScrollH - previewVisibleH);
  preview.scrollTo(0, relativeHeight);
};

// By default, the `node` parameter in `handleCustomComponents`
// below is typed as `any` if we use the default typings.
// Thus, we create `HandlerType` to have type safety for the
// `node` parameter based on the actual mdast node type.
type HandlerOption = NonNullable<Required<MdastToHastConverterOptions['handlers']>>;
type AllowedMdElements = Exclude<keyof typeof defaultHandlers, 'toml'>;
type MdastNodeType<key extends AllowedMdElements> = Extract<MdastNodes, { type: key }>;
type HandlerType = {
  [key in AllowedMdElements]?: (
    ...args: ReplaceTypeAtIndex<Parameters<HandlerOption[key]>, 1, MdastNodeType<key>>
  ) => ReturnType<HandlerOption[key]>;
};

const handleCustomComponents: HandlerType = {
  code: (state, node) => {
    const rawLang = node.lang ?? '';
    const isExecutable = rawLang.startsWith('{') && rawLang.endsWith('}');
    if (!isExecutable) {
      return defaultHandlers.code(state, node);
    }
    // TODO: Support languages other than source
    // const lang = rawLang.substring(1, rawLang.length - 1);
    const props: SourceBlockProps = {
      content: node.value,
      commands: node.meta ?? ''
    };
    // Disable typecheck as "source-block" is not a standard HTML tag
    const element = h('source-block', props) as any;
    return element;
  }
};

export const renderStoryMarkdown = (markdown: string): React.ReactNode => {
  const mdast = fromMarkdown(markdown);
  const hast = toHast(mdast, { handlers: handleCustomComponents }) ?? h();
  return (
    unified()
      .use(rehypeReact, {
        ...runtime,
        components: {
          'source-block': SourceBlock
        }
        // Disable typecheck as "source-block" is not a standard HTML tag
      } as any)
      // We use `any` due to incompatible type definitions (although it
      // actually works). Either way, this is never exposed, and so is okay.
      .stringify(hast as any)
  );
};
