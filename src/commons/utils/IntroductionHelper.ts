import { Chapter, Variant } from 'js-slang/dist/types';

import { SALanguage, styliseSublanguage } from '../application/ApplicationTypes';
import { Links } from './Constants';

const MAIN_INTRODUCTION = `
Welcome to the Source Academy playground!

The book [_Structure and Interpretation of Computer Programs, JavaScript Edition_](${Links.textbook})
uses JavaScript sublanguages that we call [_Source_](${Links.sourceDocs}). `;

const HOTKEYS_INTRODUCTION = `

In the editor on the left, you can use the [_Ace keyboard shortcuts_](${Links.aceHotkeys}) 
and also the [_Source Academy keyboard shortcuts_](${Links.sourceHotkeys}).

`;

const generateSourceDocsLink = (sourceChapter: Chapter, sourceVariant: Variant) => {
  if (sourceChapter === Chapter.FULL_JS) {
    return (
      `However, you have chosen full JavaScript; your program will be run directly using JavaScript strict mode [_(ECMAScript 2021)_](${Links.ecmaScript_2021}).` +
      '\n\n<b>Warning:</b> If your program freezes during execution, you can try refreshing the tab. ' +
      'Note that you need to open the browser console (typically by pressing `F12`) before using breakpoints.'
    );
  }

  if (sourceChapter === Chapter.HTML) {
    return (
      'However, you have chosen HTML, the standard markup language for webpages. Your code will be rendered directly as a HTML document.\n\n' +
      'JavaScript code can be added to a HTML document using the `<script>` tag; any script errors will be displayed in the output below.\n\n' +
      '<b>Note:</b> Error messages may differ between browsers, e.g. when using Safari, errors can only be viewed on the browser console itself. ' +
      'Please check the browser console (typically by pressing `F12`) for more detailed errors and warnings.'
    );
  }

  const sourceDocsLink: string = `${Links.sourceDocs}source_${sourceChapter}${
    sourceVariant !== Variant.DEFAULT && sourceVariant !== Variant.NATIVE ? `_${sourceVariant}` : ''
  }/`;

  return `You have chosen the sublanguage [_${styliseSublanguage(
    sourceChapter,
    sourceVariant
  )}_](${sourceDocsLink}).`;
};

const generateIntroductionText = (sourceChapter: Chapter, sourceVariant: Variant) => {
  return (
    MAIN_INTRODUCTION + generateSourceDocsLink(sourceChapter, sourceVariant) + HOTKEYS_INTRODUCTION
  );
};

// TODO: Remove this after migrated to language config
const generateSourceIntroduction = (sourceChapter: Chapter, sourceVariant: Variant) => {
  return generateIntroductionText(sourceChapter, sourceVariant);
};

export const generateLanguageIntroduction = (language: SALanguage) => {
  return generateSourceIntroduction(language.chapter, language.variant);
};
