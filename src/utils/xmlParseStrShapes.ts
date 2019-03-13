import { ExternalLibraryName, IQuestion } from '../components/assessment/assessmentShape'

export interface IXmlParseStrTask {
  $: IXmlParseStrOverview
  DEPLOYMENT: IXmlParseStrDeployment[]
  GRADERDEPLOYMENT: IXmlParseStrDeployment[]
  PROBLEMS: Array<{ PROBLEM: IXmlParseStrProblem[] }>
  READING: string[]
  TEXT: string[]
  WEBSUMMARY?: string[]
}

export interface IXmlParseStrDeployment {
  $: {
    interpreter: string
  }
  GLOBAL?: Array<{
    IDENTIFIER: string[]
    VALUE: string[]
  }>
  EXTERNAL?: Array<{
    $: {
      name: ExternalLibraryName
    }
    SYMBOL: string[]
  }>
}

export interface IXmlParseStrOverview {
  coverimage: string
  duedate: string
  kind: string
  title: string
  startdate: string
  story: string | null
}

export interface IXmlParseStrProblem {
  $: {
    type: IQuestion['type']
    maxgrade: string
    maxxp: string
  }
  TEXT: string[]
}

export interface IXmlParseStrPProblem extends IXmlParseStrProblem {
  SNIPPET: Array<{
    TEMPLATE: string[]
    SOLUTION: string[]
    GRADER: string[]
  }>
  TEXT: string[]
}

export interface IXmlParseStrCProblem extends IXmlParseStrProblem {
  CHOICE: IXmlParseStrProblemChoice[]
  SNIPPET: {
    SOLUTION: string[]
  }
}

export interface IXmlParseStrProblemChoice {
  $: {
    correct: string
  }
  TEXT: string[]
}
