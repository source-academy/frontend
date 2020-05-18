import { LINKS } from './constants';

const CHAP = '\xa7';

const MAIN_INTRODUCTION = `
Welcome to the Source Academy playground!

The language _Source_ is the official language of the textbook [_Structure and
Interpretation of Computer Programs, JavaScript Adaptation_](${LINKS.TEXTBOOK}).
You have never heard of Source? No worries! It was invented just for the purpose
of the book. Source is a sublanguage of ECMAScript 2016 (7th edition) and defined
in [the documents titled _"Source ${CHAP}x"_](${LINKS.SOURCE_DOCS}), where x
refers to the respective textbook chapter. For example, Source ${CHAP}3 is
suitable for textbook chapter 3 and the preceeding chapters.

The playground comes with an editor and a REPL, on the left and right of the
screen, respectively. You may customise the layout of the playground by
clicking and dragging on the right border of the editor, or the top border of
the REPL. You can view their hotkeys [here.](${LINKS.HOTKEYS})

`;

const S1_INFORMATION = `
In Source ${CHAP}1, you can use all features introduced in chapter 1 of the textbook. 
You are allowed to use the RUNES and CURVES external libraries in Source ${CHAP}1. 
You may refer to [_Source ${CHAP}1 specifications_](${LINKS.SOURCE_1}) for more details. `;

const S1_LAZY_INFORMATION = `
In Source ${CHAP}1 Lazy, argument expressions of functions are passed un-evaluated to the function
to which they are applied. 
You may refer to [_Source ${CHAP}1 Lazy specifications_](${LINKS.SOURCE_1_LAZY}) for more details. `;

const S1_WASM_INTRODUCTION = `
In Source ${CHAP}1 WebAssembly, it significantly reduces the time taken to evaluate 
functions on Source ${CHAP}1. All language fratures for Source ${CHAP}1 are supported 
except for proper tail calls. Do not that MISC, MATH, RUNES and CURVES libraries are not 
yet supported by Source ${CHAP}1 WebAssembly. 
You may refer to [_Source ${CHAP}1 WebAssembly specifications_](${LINKS.SOURCE_1_WASM}) for more details. `;

const S2_INTRODUCTION = `
In Source ${CHAP}2, the following are introduced: \`null\`: the empty list and the LISTS library. 
You are allowed to use the SOUNDS and BINARYTREES external libraries in Source ${CHAP}2. 
You may refer to [_Source ${CHAP}2 specifications_](${LINKS.SOURCE_2}) for more details. `;

const S2_LAZY_INTRODUCTION = `
In Source ${CHAP}2 Lazy, argument expressions of functions are passed un-evaluated to the function
to which they are applied. 
You may refer to [_Source ${CHAP}2 Lazy specifications_](${LINKS.SOURCE_2_LAZY}) for more details. `;

const S3_INFORMATION = `
In Source ${CHAP}3, variable declarations and variable assignment statements are allowed with the usage
of the keyword \`let\`. \`while\` and \`for\` loops are allowed. The following are introduced: 
the PAIRMUTATORS, ARRAYS and the STREAMS library. You are allowed to use the PIX&FLIX external 
library in Source ${CHAP}2. 
You may refer to [_Source ${CHAP}3 specifications_](${LINKS.SOURCE_3}) for more details. `;

const S3_NONDET_INFORMATION = `
In Source ${CHAP}3 Non-Det, it adds a built-in search mechanism on top of Source ${CHAP}3. 
This is mainly done using the \`amb\` and \`ambR\` operators. Following which, 
you can type in \`try again\` in the REPL to see it in action. 
You may refer to [_Source ${CHAP}3 Non-Det specifications_](${LINKS.SOURCE_3_NONDET}) for more details. `;

const S3_CONCURRENT_INFORMATION = `
In Source ${CHAP}3 Concurrent, all programs are concurrent programs. Hence, they do not return any
result, and can only reflect trace through calls to the \`display\` function. This includes
programs that only use one thread and do not make any calls to \`concurrent_execute\`. To
run programs concurrently, use the \`concurrent_execute\` function. 
You may refer to [_Source ${CHAP}3 Concurrent specifications_](${LINKS.SOURCE_3_CONCURRENT}) for more details. `;

const S4_INTRODUCTION = `
In Source ${CHAP}4, you are introduced to the 2 functions for MCE: \`parse\` \& 
\`apply_in_underlying_javascript\`.
You may refer to [_Source ${CHAP}4 specifications_](${LINKS.SOURCE_4}) for more details. `;

const S4_GPU_INTRODUCTION = `
In Source ${CHAP}4 GPU, it allows for Source programs to be accelerated on the GPU if certain conditions
are met. Experimentation has shown
that Source ${CHAP}4 GPU is orders of magnitude faster than Source ${CHAP}4 for heavy CPU bound tasks 
You may refer to [_Source ${CHAP}4 GPU specifications_](${LINKS.SOURCE_4_GPU}) for more details. `;

const generateChapterIntroductionText = (sourceType: string) => {
    switch (sourceType) {
        case '1 default':
            return S1_INFORMATION;
        case '1 wasm':
            return S1_WASM_INTRODUCTION;
        case '1 lazy':
            return S1_LAZY_INFORMATION;
        case '2 default':
            return S2_INTRODUCTION;
        case '2 lazy':
            return S2_LAZY_INTRODUCTION;
        case '3 default':
            return S3_INFORMATION;
        case '3 non-det':
            return S3_NONDET_INFORMATION;
        case '3 concurrent':
            return S3_CONCURRENT_INFORMATION;
        case '4 default':
            return S4_INTRODUCTION;
        case '4 gpu':
            return S4_GPU_INTRODUCTION;
        default:
            return '';
    }
};

export const generateSourceIntroduction = (sourceChapter: number, sourceVariant: string) => {
    return MAIN_INTRODUCTION + generateChapterIntroductionText( `${sourceChapter} ${sourceVariant}` );
};