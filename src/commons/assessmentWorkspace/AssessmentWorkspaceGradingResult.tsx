import { Divider, HTMLTable, Text } from '@blueprintjs/core';
import * as React from 'react';

import Markdown from '../Markdown';
import { getPrettyDate } from '../utils/DateHelper';

type AssessmentWorkspaceGradingResultProps = StateProps;

type StateProps = {
  graderName: string;
  gradedAt: string;
  xp: number;
  maxXp: number;
  comments?: string;
};

class AssessmentWorkspaceGradingResult extends React.Component<
  AssessmentWorkspaceGradingResultProps,
  {}
> {
  public render() {
    return (
      <div className="GradingResult">
        <div className="grading-result-table">
          <HTMLTable>
            <tbody>
              <tr>
                <th>XP:</th>
                <td>
                  <Text>
                    {this.props.xp} / {this.props.maxXp}
                  </Text>
                </td>
              </tr>

              <tr>
                <th>Comments:</th>
                <td>{!this.props.comments && <Text>None</Text>}</td>
              </tr>
            </tbody>
          </HTMLTable>

          {this.props.comments && (
            <HTMLTable>
              <tbody>
                <tr>
                  <td>
                    <Divider />
                    <Markdown
                      content={this.props.comments}
                      simplifiedAutoLink={true}
                      strikethrough={true}
                      tasklists={true}
                      openLinksInNewWindow={true}
                    />
                    <Divider />
                  </td>
                </tr>
              </tbody>
            </HTMLTable>
          )}

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

export default AssessmentWorkspaceGradingResult;
