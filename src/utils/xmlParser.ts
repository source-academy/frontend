import { Builder } from 'xml2js'
import {
  AssessmentCategories,
  AssessmentStatuses,
  GradingStatuses,
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
  IQuestion, 
  Library,
  MCQChoice
} from '../components/assessment/assessmentShape'
import {
  IXmlParseStrCProblem,
  IXmlParseStrDeployment,
  IXmlParseStrOverview,
  IXmlParseStrPProblem,
  IXmlParseStrProblem,
  IXmlParseStrProblemChoice,
  IXmlParseStrTask
} from '../utils/xmlParseStrShapes'; 

const editingId = -1;

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const makeEntireAssessment = (result: any) : [IAssessmentOverview, IAssessment] => {
  const assessmentArr = makeAssessment(result);
  const overview = makeAssessmentOverview(result, assessmentArr[1], assessmentArr[2]);
  return [overview, assessmentArr[0]];
}

const makeAssessmentOverview = (result: any, maxGradeVal: number, maxXpVal: number) : IAssessmentOverview => {
  const task : IXmlParseStrTask = result.CONTENT.TASK[0];
  const rawOverview : IXmlParseStrOverview = task.$;
  return {
    category: capitalizeFirstLetter(rawOverview.kind) as AssessmentCategories,
    closeAt: rawOverview.duedate,
    coverImage: rawOverview.coverimage,
    grade: 1,
    id: editingId,
    maxGrade: maxGradeVal,
    maxXp: maxXpVal,
    openAt: rawOverview.startdate,
    title: rawOverview.title,
    shortSummary: task.WEBSUMMARY ? task.WEBSUMMARY[0] : '',
    status: AssessmentStatuses.attempting,
    story: rawOverview.story,
    xp: 0,
    gradingStatus: 'none' as GradingStatuses
  }
}

const makeAssessment = (result: any) : [IAssessment, number, number] => {
  const task : IXmlParseStrTask = result.CONTENT.TASK[0];
  const rawOverview : IXmlParseStrOverview = task.$;
  const questionArr = makeQuestions(task);
  return [
    {
      category: capitalizeFirstLetter(rawOverview.kind) as AssessmentCategories,
      id: editingId,
      graderDeployment: task.GRADERDEPLOYMENT[0],
      longSummary: task.TEXT[0],
      missionPDF: 'google.com',
      questions: questionArr[0],
      title: rawOverview.title
    },
    questionArr[1],
    questionArr[2]
  ]
}

const altEval = (str: string) : any => {
    return Function('"use strict";return (' + str + ')')();
}

const makeLibrary = (deployment: IXmlParseStrDeployment) : Library => {
  const external = deployment.EXTERNAL;
  const nameVal = external ? 
    external[0].$.name
    : 'NONE';
  const symbolsVal : string[]  = external ? 
    external[0].SYMBOL 
    : [];
  const globalsVal = deployment.GLOBAL ? 
    deployment.GLOBAL.map((x) => [x.IDENTIFIER[0], altEval(x.VALUE[0]), x.VALUE[0]]) as Array<[string, any, string]>
    : [];
  return {
    chapter: parseInt(deployment.$.interpreter, 10),
    external: {
      name: nameVal,
      symbols: symbolsVal
    },
    globals: globalsVal,
  }
}

const makeQuestions = (task: IXmlParseStrTask) : [IQuestion[], number, number] => {
  const libraryVal = makeLibrary(task.DEPLOYMENT[0]);
  let maxGrade = 0;
  let maxXp = 0;
  const questions: Array<IProgrammingQuestion | IMCQQuestion> = []
  task.PROBLEMS[0].PROBLEM.forEach((problem: IXmlParseStrProblem, curId: number) => {
    const localMaxXp = problem.$.maxxp ? parseInt(problem.$.maxxp, 10) : 0;
    const question: IQuestion = {
      answer: null,
      comment: null,
      content: problem.TEXT[0],
      id: curId,
      library: libraryVal,
      type: problem.$.type,
      grader: {
        name: 'fake person',
        id: 1
      },
      gradedAt: '2038-06-18T05:24:26.026Z',
      xp: 0,
      grade: 0,
      maxGrade: parseInt(problem.$.maxgrade, 10),
      maxXp: localMaxXp
    }
    maxGrade += parseInt(problem.$.maxgrade, 10);
    maxXp += localMaxXp;
    if (question.type === 'programming') {
      questions.push(makeProgramming(problem as IXmlParseStrPProblem, question))
    }
    if (question.type === 'mcq') {
      questions.push(makeMCQ(problem as IXmlParseStrCProblem, question));
    }
  })
  return [questions, maxGrade, maxXp];
}

const makeMCQ = (problem: IXmlParseStrCProblem, question: IQuestion) : IMCQQuestion => {
  const choicesVal: MCQChoice[] = []
  let solutionVal = 0
  problem.CHOICE.forEach((choice: IXmlParseStrProblemChoice, i: number) => {
    choicesVal.push({
      content: choice.TEXT[0],
      hint: null
    })
    solutionVal = choice.$.correct === 'true' ? i : solutionVal
  })
  return {
    ...question,
    type: "mcq",
    answer: parseInt(problem.SNIPPET[0].SOLUTION[0], 10),
    choices: choicesVal,
    solution: solutionVal
  }
}

const makeProgramming = (problem: IXmlParseStrPProblem, question: IQuestion): IProgrammingQuestion => {
  const result: IProgrammingQuestion = {
    ...question,
    answer: problem.SNIPPET[0].TEMPLATE[0] as string,
    solutionTemplate: problem.SNIPPET[0].SOLUTION[0] as string,
    type: "programming"
  }
  if (problem.SNIPPET[0].GRADER){
    result.graderTemplate = problem.SNIPPET[0].GRADER[0];
  }
  return result;
}

export const exportXml = () => {
    const assessmentStr = localStorage.getItem("MissionEditingAssessmentSA");
    const overviewStr = localStorage.getItem("MissionEditingOverviewSA")
    if (assessmentStr && overviewStr){
      const assessment: IAssessment = JSON.parse(assessmentStr);
      const overview: IAssessmentOverview = JSON.parse(overviewStr);
      const builder = new Builder();
      const xmlTask : IXmlParseStrTask = assessmentToXml(assessment,overview);
      const xml = {
        CONTENT: {
          $: {
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
          },
          TASK: xmlTask
        }
      }
      let xmlStr = builder.buildObject(xml);
      xmlStr = xmlStr.replace(/(&#xD;)+/g, '');
      const element = document.createElement("a");
      const file = new Blob([xmlStr], {endings:"native", type:"text/xml;charset=UTF-8"});
      element.href = URL.createObjectURL(file);
      element.download = "myMission.xml";
      element.click();
    }
  }


export const assessmentToXml = (assessment: IAssessment, overview: IAssessmentOverview): IXmlParseStrTask => {
  const task: any = {};
  const rawOverview : IXmlParseStrOverview = {
    kind: overview.category.toLowerCase(),
    duedate: overview.closeAt,
    coverimage: overview.coverImage,
    startdate: overview.openAt,
    title: overview.title,
    story: overview.story
  };
  task.$ = rawOverview;

  task.WEBSUMMARY = overview.shortSummary;
  task.TEXT = assessment.longSummary;
  task.PROBLEMS = {PROBLEM: []};

  const library : Library = assessment.questions[0].library;
  const deployment = {
    $: {
      interpreter: library.chapter.toString()
    },
    EXTERNAL: {
      $: {
        name: library.external.name,
      }
    }
  }

  if (library.external.symbols.length !== 0){
    /* tslint:disable:no-string-literal */
    deployment.EXTERNAL["SYMBOL"] = library.external.symbols;
  }
  if (library.globals.length !== 0){
    /* tslint:disable:no-string-literal */
    deployment["GLOBAL"] = library.globals.map(
      (x) => {
        return {
          IDENTIFIER: x[0],
          VALUE: x[2]
        }
      }
    );
  }

  task.DEPLOYMENT = deployment;
  if (assessment.graderDeployment){
    task.GRADERDEPLOYMENT = assessment.graderDeployment;
  }

  assessment.questions.forEach((question: IProgrammingQuestion | IMCQQuestion) => {
    const problem = {
      $: {
        type: question.type,
        maxgrade: question.maxGrade
      },
      SNIPPET: {
        SOLUTION: question.answer
      },
      TEXT: question.content,
      CHOICE: [] as any[],
    }

    if (question.maxXp){
      /* tslint:disable:no-string-literal */
      problem.$["maxxp"] = question.maxXp;
    }

    if (question.type === 'programming') {
      problem.SNIPPET.SOLUTION = question.solutionTemplate;
      if (question.graderTemplate){
        /* tslint:disable:no-string-literal */
        problem.SNIPPET["GRADER"] = question.graderTemplate;
      }
      /* tslint:disable:no-string-literal */
      problem.SNIPPET["TEMPLATE"] = question.answer;
    }

    if (question.type === 'mcq') {
      question.choices.forEach((choice: MCQChoice, i: number) => {
        problem.CHOICE.push({
          $: {
            correct: (question.solution === i) ? 'true' : 'false',
          },
          TEXT: choice.content,
        })
      })
    }

    task.PROBLEMS.PROBLEM.push(problem);
  });

  return task;
}
