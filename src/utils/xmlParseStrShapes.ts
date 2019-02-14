import {
  IQuestion
} from '../components/assessment/assessmentShape'

export interface IXmlParseStrTask {
  $: IXmlParseStrOverview,
  TEXT: string[],
  WEBSUMMARY?: string[],
  PROBLEMS: Array<{PROBLEM: IXmlParseStrProblem[]}>,
  READING: string[],
  DEPLOYMENT: any,
}

export interface IXmlParseStrOverview {
  coverimage: string,
  duedate: string,
  kind: string,
  title: string,
  startdate: string,
  story: string | null
}

export interface IXmlParseStrProblem {
  $: {
    type: IQuestion["type"],
    maxgrade: number,
    maxxp: number
  },
  TEXT: string[]
}

export interface IXmlParseStrPProblem extends IXmlParseStrProblem {
  SNIPPET: Array<{
    TEMPLATE: string[],
    SOLUTION: Array<string | null>,
    GRADER: string[]
  }>,
  TEXT: string[]
}

export interface IXmlParseStrCProblem extends IXmlParseStrProblem {
  CHOICE: IXmlParseStrProblemChoice[],
  SNIPPET: {
    SOLUTION: string[]
  },
}

export interface IXmlParseStrProblemChoice {
  $: {
    correct: string
  },
  TEXT: string[]
}