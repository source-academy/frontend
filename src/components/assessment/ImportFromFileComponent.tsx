import * as React from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { parseString } from 'xml2js'
import { updateAssessment } from '../../actions/session'
import {
  AssessmentCategories,
  AssessmentStatuses,
  IAssessment,
  IAssessmentOverview,
  IMCQQuestion,
  IProgrammingQuestion,
} from '../../components/assessment/assessmentShape'
import { mock2DRuneLibrary } from '../../mocks/assessmentAPI'
import { makeEntireAssessment, retrieveLocalAssessment } from '../../utils/xmlParser'
// import assessment from '../../containers/assessment';

const overviewTemplate: IAssessmentOverview =
  {
    category: AssessmentCategories.Mission,
    closeAt: Date(),
    coverImage: 'https://fakeimg.pl/300/',
    grade: 1,
    id: -1,
    maxGrade: 0,
    maxXp: 0,
    openAt: Date(),
    title: 'Insert title here',
    shortSummary:
      'Insert short summary here',
    status: AssessmentStatuses.not_attempted,
    story: 'mission',
    xp: 0,
    gradingStatus: 'none'
  }
  
const questionsTemplate: Array<IProgrammingQuestion | IMCQQuestion> = [{
    answer: null,
    comment: '`Great Job` **young padawan**',
    content: 'Hello and welcome to this assessment! This is the 1st question.',
    id: 0,
    library: mock2DRuneLibrary,
    solutionTemplate: '1st question mock solution template',
    type: 'programming',
    grader: {
      name: 'avenger',
      id: 1
    },
    gradedAt: '2038-06-18T05:24:26.026Z',
    xp: 0,
    grade: 0,
    maxGrade: 2,
    maxXp: 2
  }]

const assessmentTemplate: IAssessment = {
    category: 'Mission',
    id: -1,
    longSummary:
      'Insert mission briefing here',
    missionPDF: 'www.google.com',
    questions: questionsTemplate,
    title: 'Insert title here'
  }

interface IDispatchProps {
  newAssessment: (assessment: IAssessment) => void
}

const mapStateToProps: MapStateToProps<{}, any, {}> = (_, ownProps) => ownProps

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      newAssessment: updateAssessment,
    },
    dispatch
  )

type Props = {
	newAssessment: (assessment: IAssessment) => void,
	updateEditingOverview: (overview: IAssessmentOverview) => void
}

export class ImportFromFileComponent extends React.Component<Props, {isInvalidXml: boolean}> {
  private fileReader: FileReader
  public constructor(props: any) {
    super(props)
    this.handleFileRead = this.handleFileRead.bind(this)
    this.handleChangeFile = this.handleChangeFile.bind(this)
    this.makeMission = this.makeMission.bind(this)
    this.state = {
      isInvalidXml: false,
    }
  }

  public componentDidMount(){
  	const assessment = retrieveLocalAssessment();
  	if (assessment) {
  		this.props.newAssessment(assessment);
  	}
  }

  public render() {
    return (
      <div>
        <input type="file" id="file" accept=".xml" onChange={this.handleChangeFile} />
        <button onClick={this.makeMission}>Make New Mission</button>
        {this.state.isInvalidXml ? <div>The xml uploaded is invalid.</div> : <div>You can edit this card</div>}
      </div>
    )
  }

  private handleFileRead = (e: any) => {
    const content = this.fileReader.result
    if (content) {
      parseString(content, 
      	(err: any, result: any) => {
        // tslint:disable-next-line:no-console
        // console.dir(result)
        try {
          const entireAssessment: [IAssessmentOverview, IAssessment] = makeEntireAssessment(result);
          // tslint:disable-next-line:no-console
          console.dir(entireAssessment)
	        localStorage.setItem("MissionEditingOverviewSA", JSON.stringify(entireAssessment[0]));
	        this.props.updateEditingOverview(entireAssessment[0]);

	        localStorage.setItem("MissionEditingAssessmentSA", JSON.stringify(entireAssessment[1]));
	        this.props.newAssessment(entireAssessment[1]);
	        this.setState({
        		isInvalidXml: false
        	})
	      } catch(err) {
	      	// tslint:disable-next-line:no-console
        	console.log(err);
        	this.setState({
        		isInvalidXml: true
        	})
	      }
      })
    }
  }

  private handleChangeFile = (e: any) => {
    const files = e.target.files
    if (e.target.files) {
      this.fileReader = new FileReader()
      this.fileReader.onloadend = this.handleFileRead
      this.fileReader.readAsText(files[0])
    }
  }

  private makeMission = (e : any) => {
    localStorage.setItem("MissionEditingOverviewSA", JSON.stringify(overviewTemplate));
    this.props.updateEditingOverview(overviewTemplate);

    localStorage.setItem("MissionEditingAssessmentSA", JSON.stringify(assessmentTemplate));
    this.props.newAssessment(assessmentTemplate);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportFromFileComponent)
