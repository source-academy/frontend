import { LINKS } from './Constants';

const CHAP = '\xa7';

const MAIN_INTRODUCTION = `
Welcome to the Source Academy playground!

The language [_Source_](${LINKS.SOURCE_DOCS}) is the official language of the textbook [_Structure and
Interpretation of Computer Programs, JavaScript Adaptation_](${LINKS.TEXTBOOK}). `;

const HOTKEYS_INTRODUCTION = `

In the editor on the left, you can use the [_Ace keyboard shortcuts_](${LINKS.ACE_HOTKEYS}) 
and also the [_Source Academy keyboard shortcuts_](${LINKS.SOURCE_HOTKEYS}).

`;

const generateSourceDocsLink = (sourceType: string) => {
  switch (sourceType) {
    case '1 default':
      return `You have chosen the sublanguage [_Source ${CHAP}1_](${LINKS.SOURCE_1}).`;
    case '1 wasm':
      return `You have chosen the sublanguage [_Source ${CHAP}1 WebAssembly_](${LINKS.SOURCE_1_WASM}).`;
    case '1 lazy':
      return `You have chosen the sublanguage [_Source ${CHAP}1 Lazy_](${LINKS.SOURCE_1_LAZY}).`;
    case '2 default':
      return `You have chosen the sublanguage [_Source ${CHAP}2_](${LINKS.SOURCE_2}).`;
    case '2 lazy':
      return `You have chosen the sublanguage [_Source ${CHAP}2 Lazy_](${LINKS.SOURCE_2_LAZY}).`;
    case '3 default':
      return `You have chosen the sublanguage [_Source ${CHAP}3_](${LINKS.SOURCE_3}).`;
    case '3 non-det':
      return `You have chosen the sublanguage [_Source ${CHAP}3 Non-Det_](${LINKS.SOURCE_3_NONDET}).`;
    case '3 concurrent':
      return `You have chosen the sublanguage [_Source ${CHAP}3 Concurrent_](${LINKS.SOURCE_3_CONCURRENT}).`;
    case '4 default':
      return `You have chosen the sublanguage [_Source ${CHAP}4_](${LINKS.SOURCE_4}).`;
    case '4 gpu':
      return `You have chosen the sublanguage [_Source ${CHAP}4 GPU_](${LINKS.SOURCE_4_GPU}).`;
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
