import * as React from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { parseString } from 'xml2js'
import { updateAssessment, updateAssessmentOverview } from '../../actions/session'
import {
  IAssessment,
  IAssessmentOverview,
} from '../../components/assessment/assessmentShape'
import { makeAssessment, makeAssessmentOverview } from '../../utils/xmlParser'
// import { IDispatchProps } from '../../components/assessment'

export interface IDispatchProps {
  newAssessment: (assessment: IAssessment) => void
  newAssessmentOverview: (overview: IAssessmentOverview) => void
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

export class ImportFromFileComponent extends React.Component<any, any> {
  private fileReader: FileReader
  public constructor(props: any) {
    super(props)
    this.handleFileRead = this.handleFileRead.bind(this)
    this.handleChangeFile = this.handleChangeFile.bind(this)
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
      parseString(content, (err: any, result: any) => {
        const task = result.CONTENT.TASK[0]
        // tslint:disable-next-line:no-console
        console.dir(task)
        const overview: IAssessmentOverview = makeAssessmentOverview(result)
        this.props.newAssessmentOverview(overview)
        const assessment: IAssessment = makeAssessment(result)
        this.props.newAssessment(assessment)
      })
    }
    // You can set content in state and show it in render.
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
