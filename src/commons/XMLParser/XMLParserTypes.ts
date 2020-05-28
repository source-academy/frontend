import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { Question } from '../assessment/AssessmentTypes';

export const EDITING_ID = -1;

export type XmlParseStrTask = {
  $: XmlParseStrOverview;
  DEPLOYMENT: XmlParseStrDeployment[];
  GRADERDEPLOYMENT: XmlParseStrDeployment[];
  PROBLEMS: Array<{ PROBLEM: XmlParseStrProblem[] }>;
  READING: string[];
  TEXT: string[];
  WEBSUMMARY?: string[];
};

export type XmlParseStrDeployment = {
  $: {
    interpreter: string;
  };
  GLOBAL?: Array<{
    IDENTIFIER: string[];
    VALUE: string[];
  }>;
  IMPORT?: Array<{
    $: {
      name: ExternalLibraryName;
    };
    SYMBOL: string[];
  }>;
  // deprecated EXTERNAL in DEPLOYMENT and GRADERDEPLOYMENT, use IMPORT instead
  EXTERNAL?: Array<{
    $: {
      name: ExternalLibraryName;
    };
    SYMBOL: string[];
  }>;
};

export type XmlParseStrOverview = {
  coverimage: string;
  duedate: string;
  kind: string;
  number: string;
  title: string;
  startdate: string;
  story: string | null;
};

export type XmlParseStrProblem = {
  $: {
    type: Question['type'];
    maxgrade: string;
    maxxp: string;
  };
  DEPLOYMENT?: XmlParseStrDeployment[];
  GRADERDEPLOYMENT?: XmlParseStrDeployment[];
  TEXT: string[];
};

type PProblem = {
  SNIPPET: Array<{
    TEMPLATE: string[];
    PREPEND: string;
    SOLUTION: string[];
    POSTPEND: string;
    TESTCASES: Array<{
      PUBLIC?: XmlParseStrTestcase[];
      PRIVATE?: XmlParseStrTestcase[];
    }>;
    GRADER: string[];
  }>;
  TEXT: string[];
};

export type XmlParseStrPProblem = PProblem & XmlParseStrProblem;

type CProblem = {
  CHOICE: XmlParseStrProblemChoice[];
  SNIPPET: {
    SOLUTION: string[];
  };
};

export type XmlParseStrCProblem = CProblem & XmlParseStrProblem;

export type XmlParseStrProblemChoice = {
  $: {
    correct: string;
  };
  TEXT: string[];
};

export type XmlParseStrTestcase = {
  $: {
    answer: string;
    score: string;
  };
  _: string;
};
