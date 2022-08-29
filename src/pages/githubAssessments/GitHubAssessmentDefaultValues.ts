import { Chapter } from 'js-slang/dist/types';

import { IMCQQuestion } from '../../commons/assessment/AssessmentTypes';
import { MissionMetadata, TaskData } from '../../commons/githubAssessments/GitHubMissionTypes';

export const defaultMissionBriefing = `### Assignment Briefing (Click to Edit!)
Welcome to Assignment Creator! This is where the Briefing for each assignment will appear.

If you are on the SourceAcademy website, you may edit **this section** by clicking on it. You can also add or delete questions through the control bar.

The text written here will show up as the \`README.md\` file on the GitHub repository.

Please also refer to our instructor's guide [here](https://github.com/source-academy/general/tree/master/instructor/github) to learn more about how to use this website.

### Brief Markdown Cheatsheet
Everything here is written in Markdown.

This means that you can **bolden** or *italicize* text by adding asterisks.

Programs can be formatted through the use of triple backticks:
\`\`\`
// This is a program example
\`\`\`
If you want to in-line program snippets, rather than display it as a block, you can also use single backticks like \`this\`.

Lists can be created by adding dashes to the start of a line:
- First element
- Second element
- Third element


It is also possible to embed images, like this:

![an embedded image](https://avatars.githubusercontent.com/u/35620705?s=400&u=32f72fd1d65a0d6877ad1d5870ffa327dda754f1&v=4)

If you need a more detailed cheatsheet, please click [here](https://www.markdownguide.org/cheat-sheet/)!
`;

export const defaultTaskDescription = `### Problem Description (Click to Edit!)
Welcome to the Assignment Creator! This is where the problem description specific to each problem should be written.

If you are on the SourceAcademy website, you may edit **this section** by clicking on it. You can also add or delete questions through the control bar.

If you would like to add new questions outside of the website, simply duplicate this folder, and edit the \`Problem.md\` and \`StarterCode.js\` files accordingly. Make sure that the folders are named 'Q1', 'Q2', 'Q3' and so on.

Please also refer to our instructor's guide [here](https://github.com/source-academy/general/tree/master/instructor/github).

### Brief Markdown Cheatsheet
Everything here is written in Markdown.

This means that you can **bolden** or *italicize* text by adding asterisks.

Programs can be formatted through the use of triple backticks:
\`\`\`
// This is a program example
\`\`\`
If you want to in-line program snippets, rather than display it as a block, you can also use single backticks like \`this\`.

Lists can be created by adding dashes to the start of a line:
- First element
- Second element
- Third element


It is also possible to embed images, like this:

![an embedded image](https://avatars.githubusercontent.com/u/35620705?s=400&u=32f72fd1d65a0d6877ad1d5870ffa327dda754f1&v=4)

If you need a more detailed cheatsheet, please click [here](https://www.markdownguide.org/cheat-sheet/)!
`;

export const defaultStarterCode = '// Your program here!\n';

export const defaultMissionMetadata = {
  sourceVersion: Chapter.SOURCE_1
} as MissionMetadata;

export const defaultTask = {
  questionNumber: 0,
  taskDescription: defaultTaskDescription,
  starterCode: defaultStarterCode,
  savedCode: defaultStarterCode,
  testPrepend: '',
  testPostpend: '',
  testCases: []
} as TaskData;

export const defaultMCQQuestion = {
  answer: -1,
  choices: [],
  solution: -1,
  type: 'mcq',
  content: '',
  grade: 0,
  id: 0,
  library: { chapter: Chapter.SOURCE_4, external: { name: 'NONE', symbols: [] }, globals: [] },
  maxGrade: 0,
  xp: 0,
  maxXp: 0
} as IMCQQuestion;
