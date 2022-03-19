import { Variant } from 'js-slang/dist/types';

import { isFullJSChapter, styliseSublanguage, sublanguages } from '../application/ApplicationTypes';
import { Links } from './Constants';

const MAIN_INTRODUCTION = `
Welcome to the Source Academy playground!

The book [_Structure and Interpretation of Computer Programs, JavaScript Edition_](${Links.textbook})
uses JavaScript sublanguages that we call [_Source_](${Links.sourceDocs}). `;

const HOTKEYS_INTRODUCTION = `

In the editor on the left, you can use the [_Ace keyboard shortcuts_](${Links.aceHotkeys}) 
and also the [_Source Academy keyboard shortcuts_](${Links.sourceHotkeys}).

`;

const generateSourceDocsLink = (sourceChapter: number, sourceVariant: Variant) => {
  if (isFullJSChapter(sourceChapter)) {
    return (
      `However, you have chosen full JavaScript, which runs your program directly, using JavaScript strict mode [_(ECMAScript 2021)_](${Links.ecmaScript_2021}).` +
      '\n\n<b>Warning:</b> If your program freezes during execution, you can try refreshing the tab. ' +
      'Note that you need to open the browser console (typically by pressing `F12`) before using breakpoints.'
    );
  }

  // `.includes` and `.find` are not used here since we are dealing with reference types
  if (
    sublanguages.filter(lang => lang.chapter === sourceChapter && lang.variant === sourceVariant)
      .length === 0
  ) {
    return 'You have chosen an invalid sublanguage. Please pick a sublanguage from the dropdown instead.';
  }

  const sourceDocsLink: string = `${Links.sourceDocs}source_${sourceChapter}${
    sourceVariant !== 'default' && sourceVariant !== 'native' ? `_${sourceVariant}` : ''
  }/`;

  return `You have chosen the sublanguage [_${styliseSublanguage(
    sourceChapter,
    sourceVariant
  )}_](${sourceDocsLink}).`;
};

const generateIntroductionText = (sourceChapter: number, sourceVariant: Variant) => {
  return (
    MAIN_INTRODUCTION + generateSourceDocsLink(sourceChapter, sourceVariant) + HOTKEYS_INTRODUCTION
  );
};

export const generateSourceIntroduction = (sourceChapter: number, sourceVariant: Variant) => {
  return generateIntroductionText(sourceChapter, sourceVariant);
};
