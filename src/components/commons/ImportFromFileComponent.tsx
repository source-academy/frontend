import * as React from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux"
import { bindActionCreators, Dispatch } from 'redux'
import { parseString } from 'xml2js'
import { updateAssessment, updateAssessmentOverview} from '../../actions/session'
import { 
	AssessmentCategories,
	AssessmentStatuses,
	ExternalLibraryNames, 
	GradingStatuses,
	IAssessment, 
	IAssessmentOverview,
	IMCQQuestion,
  IProgrammingQuestion,
	Library,
	MCQChoice 
} from '../../components/assessment/assessmentShape'
import { externalLibraries } from '../../reducers/externalLibraries'
// import { IDispatchProps } from '../../components/assessment'

export interface IDispatchProps {
	newAssessment: (overview: IAssessment) => void
  newAssessmentOverview: (assessment: IAssessmentOverview) => void
}

const mapStateToProps: MapStateToProps<{}, any, {}> = (_, ownProps) => ownProps

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      newAssessment: updateAssessment,
      newAssessmentOverview: updateAssessmentOverview
    },
    dispatch
  )

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const makeAssessmentOverview = (task: any) => {
	const rawOverview = task.$;
	return {
		category: capitalizeFirstLetter(rawOverview.kind) as AssessmentCategories,
    closeAt: rawOverview.duedate,
    coverImage: rawOverview.coverimage,
    grade: 1,
    id: 7,
    maxGrade: 3000,
    maxXp: 1000,
    openAt: rawOverview.startdate,
    title: rawOverview.title,
    shortSummary: task.WEBSUMMARY[0],
    status: AssessmentStatuses.not_attempted,
    story: rawOverview.story,
    xp: 0,
    gradingStatus: "none" as GradingStatuses
	}
}

const makeAssessment =  (task: any) => {
	const rawOverview = task.$;
	return {
		category: capitalizeFirstLetter(rawOverview.kind) as AssessmentCategories,
  	id: 7,
  	longSummary: task.TEXT[0],
  	missionPDF: "google.com",
  	questions: makeQuestions(task),
  	title: rawOverview.title,
	}
}

const mockGlobals: Array<[string, any]> = [
  ['testNumber', 3.141592653589793],
  ['testString', 'who dat boi'],
  ['testBooleanTrue', true],
  ['testBooleanFalse', false],
  ['testBooleanUndefined', undefined],
  ['testBooleanNull', null],
  ['testObject', { a: 1, b: 2 }],
  ['testArray', [1, 2, 'a', 'b']]
]

const mockSoundLibrary: Library = {
  chapter: 1,
  external: {
    name: ExternalLibraryNames.SOUND,
    symbols: externalLibraries.get(ExternalLibraryNames.SOUND)!
  },
  globals: mockGlobals
}

const makeQuestions = (task: any) => {
	const questions: Array<IProgrammingQuestion | IMCQQuestion> = [];
	task.PROBLEMS[0].PROBLEM.forEach(
		(problem: any, curId: number) => {
			const question = {
			  comment: null,
			  content: problem.TEXT[0],
			  id: curId,
			  library: mockSoundLibrary,
			  type: problem.$.type,
			  grader: {
			    name: "fake person",
			    id: 1,
			  },
			  gradedAt: '2038-06-18T05:24:26.026Z',
			  xp: 0,
			  grade: 0,
			  maxGrade: problem.$.maxgrade,
			  maxXp: problem.$.maxxp,
			}
			let qn: IProgrammingQuestion | IMCQQuestion;
			if (question.type === "programming"){
				qn = {
					...question,
					answer: problem.SNIPPET[0].TEMPLATE[0],
					solutionTemplate: problem.SNIPPET[0].SOLUTION[0],
				}
				questions.push(qn);
			}  
			if (question.type === "mcq"){
				const choicess: MCQChoice[] = [];
				let ans = 0;
				problem.CHOICE.forEach(
					(choice: any, i: number) => {
						choicess.push({
							content: choice.TEXT[0],
							hint: null
						});
						ans = choice.$.correct === "true" ? i : ans;
					}
				)
				qn = {
					...question,
					answer: problem.SNIPPET[0].SOLUTION[0],
					choices: choicess,
					solution: ans	
				}
				questions.push(qn);
			}
		}
	)
	return questions;
}

export class ImportFromFileComponent extends React.Component<any, any>{
	private fileReader : FileReader;
	public constructor(props: any) {
    super(props);
    this.handleFileRead = this.handleFileRead.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
  }

	public render(){
	  return(
	     <div>
	        <input 
	        	type="file" 
	        	id="file"
	        	accept=".xml" 
	        	onChange={this.handleChangeFile} 
	        /> 
	     </div>
	  )
	}

	private handleFileRead = (e: any) => {
	  const content = this.fileReader.result;
	  if (content) {
		  parseString(content, (err: any, result: any) => {
	    	const task = result.CONTENT.TASK[0];
	    	// tslint:disable-next-line:no-console
	    	console.dir(task);
	    	const overview: IAssessmentOverview  =  makeAssessmentOverview(task);
	    	this.props.newAssessmentOverview(overview);
	    	const assessment: IAssessment = makeAssessment(task);
	    	this.props.newAssessment(assessment);
			});
		}
	  // You can set content in state and show it in render.
	}

	private handleChangeFile = (e: any) => {
		const files = e.target.files
		if (e.target.files){
		  this.fileReader = new FileReader();
		  this.fileReader.onloadend = this.handleFileRead;
		  this.fileReader.readAsText(files[0]);
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportFromFileComponent)