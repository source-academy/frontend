import { Divider, HTMLTable, Text } from '@blueprintjs/core';
import React from 'react';

import Markdown from '../Markdown';
import { getPrettyDate } from '../utils/DateHelper';

type Props = {
  graderName: string;
  gradedAt: string;
  xp: number;
  maxXp: number;
  comments?: string;
};

const AssessmentWorkspaceGradingResult: React.FC<Props> = props => (
  <div className="GradingResult">
    <div className="grading-result-table">
      <HTMLTable>
        <tbody>
          <tr>
            <th>XP:</th>
            <td>
              <Text>
                {props.xp} / {props.maxXp}
              </Text>
            </td>
          </tr>

          <tr>
            <th>Comments:</th>
            <td>{!props.comments && <Text>None</Text>}</td>
          </tr>
        </tbody>
      </HTMLTable>

      {props.comments && (
        <HTMLTable>
          <tbody>
            <tr>
              <td>
                <Divider />
                <Markdown
                  content={props.comments}
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
          Graded by <b>{props.graderName}</b> on {getPrettyDate(props.gradedAt)}
        </Text>
      </div>
    </div>
  </div>
);

export default AssessmentWorkspaceGradingResult;
