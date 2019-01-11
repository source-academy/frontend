import * as React from 'react'
import { getPrettyDate } from '../../utils/dateHelpers'

type AssessmentGradingProps = OwnProps

export type OwnProps = {
  comment: string | null
  graderName: string
  gradedAt: string
  xp: number
  grade: number
  maxGrade: number
  maxXp: number
}

class AssessmentGrading extends React.Component<AssessmentGradingProps, {}> {
  constructor(props: AssessmentGradingProps) {
    super(props)
  }

  public render() {
    return (
      <div className="AssessmentGrading">
        <h3>PLEASE HELP TO MAKE THIS PRETTY</h3>

        <p>GRADED BY: {this.props.graderName}</p>
        <p>LAST GRADED AT: {getPrettyDate(this.props.gradedAt)}</p>

        <p>
          GRADE: {this.props.grade} / {this.props.maxGrade}
        </p>
        <p>
          XP: {this.props.xp} / {this.props.maxXp}
        </p>

        {this.props.comment !== null ? <p>COMMENTS: {this.props.comment}</p> : null}
      </div>
    )
  }
}

export default AssessmentGrading
