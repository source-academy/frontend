import { Icon, Intent, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
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
        <div className="assessment-grading-table">
          <table>
            <tbody>
              <tr>
                <th>Grade:</th>
                <td>
                  <Text>
                    {this.props.grade} / {this.props.maxGrade}
                  </Text>
                </td>

                {this.props.grade === this.props.maxGrade ? (
                  <td>
                    <Icon icon={IconNames.THUMBS_UP} intent={Intent.SUCCESS} />
                  </td>
                ) : null}
              </tr>

              <tr>
                <th>XP:</th>
                <td>
                  <Text>
                    {this.props.xp} / {this.props.maxXp}
                  </Text>
                </td>

                {this.props.xp === this.props.maxXp ? (
                  <td>
                    <Icon icon={IconNames.THUMBS_UP} intent={Intent.SUCCESS} />
                  </td>
                ) : null}
              </tr>
            </tbody>
          </table>

          {this.props.comment !== null ? (
            <div>
              <br />
              <th>Comment:</th>
              <p>
                <pre>{this.props.comment}</pre>
              </p>
            </div>
          ) : null}

          <br />

          <div className="assessment-grading-info">
            <Text>
              last graded by <b>{this.props.graderName}</b> at {getPrettyDate(this.props.gradedAt)}.
            </Text>
          </div>
        </div>
      </div>
    )
  }
}

export default AssessmentGrading
