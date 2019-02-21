import * as React from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { parseString } from 'xml2js'
import { updateAssessment } from '../../actions/session'
import {
  IAssessment,
  IAssessmentOverview,
} from '../../components/assessment/assessmentShape'
import { makeEntireAssessment } from '../../utils/xmlParser'

export interface IDispatchProps {
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

export class ImportFromFileComponent extends React.Component<Props> {
  private fileReader: FileReader
  public constructor(props: any) {
    super(props)
    this.handleFileRead = this.handleFileRead.bind(this)
    this.handleChangeFile = this.handleChangeFile.bind(this)
  }

  public componentDidMount(){
  	const assessment = localStorage.getItem("MissionEditingAssessmentSA");
  	if (assessment) {
  		this.props.newAssessment(JSON.parse(assessment));
  	}
  }

  public render() {
    return (
      <div>
        <input type="file" id="file" accept=".xml" onChange={this.handleChangeFile} />
      </div>
    )
  }

  private handleFileRead = (e: any) => {
    const content = this.fileReader.result
    if (content) {
      parseString(content, 
      	(err: any, result: any) => {
        // tslint:disable-next-line:no-console
        console.dir(result)
        const entireAssessment: [IAssessmentOverview, IAssessment] = makeEntireAssessment(result);
        localStorage.setItem("MissionEditingOverviewSA", JSON.stringify(entireAssessment[0]));
        this.props.updateEditingOverview(entireAssessment[0]);

        localStorage.setItem("MissionEditingAssessmentSA", JSON.stringify(entireAssessment[1]));
        this.props.newAssessment(entireAssessment[1]);
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
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportFromFileComponent)
