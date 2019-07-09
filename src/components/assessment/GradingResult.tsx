import { HTMLTable, Text } from '@blueprintjs/core';
import * as React from 'react';
import { getPrettyDate } from '../../utils/dateHelpers';

type GradingResultProps = OwnProps;

export type OwnProps = {
  graderName: string;
  gradedAt: string;
  xp: number;
  grade: number;
  maxGrade: number;
  maxXp: number;
};

class GradingResult extends React.Component<GradingResultProps, {}> {
  constructor(props: GradingResultProps) {
    super(props);
  }

  public render() {
    return (
      <div className="GradingResult">
        <div className="grading-result-table">
          <HTMLTable>
            <tbody>
              <tr>
                <th>Grade:</th>
                <td>
                  <Text>
                    {this.props.grade} / {this.props.maxGrade}
                  </Text>
                </td>
              </tr>

              <tr>
                <th>XP:</th>
                <td>
                  <Text>
                    {this.props.xp} / {this.props.maxXp}
                  </Text>
                </td>
              </tr>
            </tbody>
          </HTMLTable>

          <br />

          <div className="grading-result-info">
            <Text>
              Graded by <b>{this.props.graderName}</b> on {getPrettyDate(this.props.gradedAt)}
            </Text>
          </div>
        </div>
      </div>
    );
  }
}

export default GradingResult;
