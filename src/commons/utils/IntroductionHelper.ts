import { Links } from './Constants';

const CHAP = '\xa7';

const MAIN_INTRODUCTION = `
Welcome to the Source Academy playground!

The language [_Source_](${Links.sourceDocs}) is the official language of the textbook [_Structure and
Interpretation of Computer Programs, JavaScript Adaptation_](${Links.textbook}). `;

const HOTKEYS_INTRODUCTION = `

In the editor on the left, you can use the [_Ace keyboard shortcuts_](${Links.aceHotkeys}) 
and also the [_Source Academy keyboard shortcuts_](${Links.sourceHotkeys}).

`;

const generateSourceDocsLink = (sourceType: string) => {
  switch (sourceType) {
    case '1 default':
      return `You have chosen the sublanguage [_Source ${CHAP}1_](${Links.source_1}).`;
    case '1 wasm':
      return `You have chosen the sublanguage [_Source ${CHAP}1 WebAssembly_](${Links.source_1_Wasm}).`;
    case '1 lazy':
      return `You have chosen the sublanguage [_Source ${CHAP}1 Lazy_](${Links.source_1_Lazy}).`;
    case '2 default':
      return `You have chosen the sublanguage [_Source ${CHAP}2_](${Links.source_2}).`;
    case '2 lazy':
      return `You have chosen the sublanguage [_Source ${CHAP}2 Lazy_](${Links.source_2_Lazy}).`;
    case '3 default':
      return `You have chosen the sublanguage [_Source ${CHAP}3_](${Links.source_3}).`;
    case '3 non-det':
      return `You have chosen the sublanguage [_Source ${CHAP}3 Non-Det_](${Links.source_3_Nondet}).`;
    case '3 concurrent':
      return `You have chosen the sublanguage [_Source ${CHAP}3 Concurrent_](${Links.source_3_Concurrent}).`;
    case '4 default':
      return `You have chosen the sublanguage [_Source ${CHAP}4_](${Links.source_4}).`;
    case '4 gpu':
      return `You have chosen the sublanguage [_Source ${CHAP}4 GPU_](${Links.source_4_Gpu}).`;
    default:
      return 'You have chosen an invalid sublanguage. Please pick a sublanguage from the dropdown instead.';
  }
};

const generateIntroductionText = (sourceType: string) => {
  return MAIN_INTRODUCTION + generateSourceDocsLink(sourceType) + HOTKEYS_INTRODUCTION;
};

export const generateSourceIntroduction = (sourceChapter: number, sourceVariant: string) => {
  return generateIntroductionText(`${sourceChapter} ${sourceVariant}`);
};
