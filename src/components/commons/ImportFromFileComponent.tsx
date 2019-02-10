import * as React from 'react'
import { connect, MapDispatchToProps } from "react-redux"
import { bindActionCreators, Dispatch } from 'redux'
import { parseString } from 'xml2js'
import { updateAssessment, updateAssessmentOverview} from '../../actions/session'
import { 
	AssessmentCategories,
	AssessmentStatuses, 
	GradingStatuses,
	// IAssessment, 
	IAssessmentOverview 
} from '../../components/assessment/assessmentShape'
// import { IDispatchProps } from '../../components/assessment'


const mapDispatchToProps: MapDispatchToProps<any, IAssessmentOverview> = (dispatch: Dispatch<any>) =>
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

class ImportFromFileComponent extends React.Component<any, any>{
	public fileReader : FileReader;
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
		  	// tslint:disable-next-line:no-console
	    	console.dir(result);
	    	const task = result.CONTENT.TASK[0];
	    	const overview: IAssessmentOverview  =  makeAssessmentOverview(task);
	    	this.props.newAssessmentOverview(overview);
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

export default connect(null, mapDispatchToProps)(ImportFromFileComponent)