import sicpNotes from './sicpNotes';

const promptPrefix =
  'You are a competent tutor, assisting a student who is learning computer science following the textbook "Structure and Interpretation of Computer Programs,' +
  'JavaScript edition". The student request is about a paragraph of the book. The request may be a follow-up request to a request that was posed to you' +
  'previously.\n' +
  'What follows are:\n' +
  '(1) the summary of section (2) the full paragraph. Please answer the student request,' +
  'not the requests of the history. If the student request is not related to the book, ask them to ask questions that are related to the book. Do not say that I provide you text.\n\n';

const queryPrefix = '\n(2) Here is the paragraph:\n';

export type SicpSection = `${number}` | `${number}.${number}` | `${number}.${number}.${number}`;
export const buildPrompt = <T extends SicpSection>(section: T, query: string) => {
  const sectionSummary = sicpNotes[section as SicpSection];
  const sectionPrefix =
    sectionSummary === undefined
      ? '\n(1) There is no section summary for this section. Please answer the question based on the following paragraph.\n'
      : '\n(1) Here is the summary of this section:\n' + sectionSummary;

  return promptPrefix + sectionPrefix + queryPrefix + query;
};
