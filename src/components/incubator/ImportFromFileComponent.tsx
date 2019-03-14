import * as React from 'react'
import { parseString } from 'xml2js'
import { IAssessment, IAssessmentOverview } from '../../components/assessment/assessmentShape'
import { makeEntireAssessment, retrieveLocalAssessment } from '../../utils/xmlParser'
import { assessmentTemplate, overviewTemplate } from '../incubator/assessmentTemplates'

type Props = {
  newAssessment: (assessment: IAssessment) => void
  updateEditingOverview: (overview: IAssessmentOverview) => void
}

export class ImportFromFileComponent extends React.Component<Props, { isInvalidXml: boolean }> {
  private fileReader: FileReader
  public constructor(props: any) {
    super(props)
    this.handleFileRead = this.handleFileRead.bind(this)
    this.handleChangeFile = this.handleChangeFile.bind(this)
    this.makeMission = this.makeMission.bind(this)
    this.state = {
      isInvalidXml: false
    }
  }

  public componentDidMount() {
    const assessment = retrieveLocalAssessment()
    if (assessment) {
      this.props.newAssessment(assessment)
    }
  }

  public render() {
    return (
      <div>
        <input type="file" id="file" accept=".xml" onChange={this.handleChangeFile} />
        <button onClick={this.makeMission}>Make New Mission</button>
        {this.state.isInvalidXml ? (
          <div>The xml uploaded is invalid.</div>
        ) : (
          <div>You can edit this card</div>
        )}
      </div>
    )
  }

  private handleFileRead = (e: any) => {
    const content = this.fileReader.result
    if (content) {
      parseString(content, (err: any, result: any) => {
        // tslint:disable-next-line:no-console
        // console.dir(result)
        try {
          const entireAssessment: [IAssessmentOverview, IAssessment] = makeEntireAssessment(result)
          localStorage.setItem('MissionEditingOverviewSA', JSON.stringify(entireAssessment[0]))
          this.props.updateEditingOverview(entireAssessment[0])

          localStorage.setItem('MissionEditingAssessmentSA', JSON.stringify(entireAssessment[1]))
          this.props.newAssessment(entireAssessment[1])
          this.setState({
            isInvalidXml: false
          })
        } catch (err) {
          // tslint:disable-next-line:no-console
          console.log(err)
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

  private makeMission = (e: any) => {
    localStorage.setItem('MissionEditingOverviewSA', JSON.stringify(overviewTemplate))
    this.props.updateEditingOverview(overviewTemplate)

    localStorage.setItem('MissionEditingAssessmentSA', JSON.stringify(assessmentTemplate))
    this.props.newAssessment(assessmentTemplate)
  }
}

export default ImportFromFileComponent
