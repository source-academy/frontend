import { Card, Classes, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import { parseError } from 'js-slang';
import { stringify } from 'js-slang/dist/utils/stringify';
import React from 'react';

import { Testcase, TestcaseTypes } from '../../assessment/AssessmentTypes';
import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';

type SideContentTestcaseCardProps = DispatchProps & StateProps & OwnProps;

type DispatchProps = {
  handleTestcaseEval: (testcaseId: number) => void;
};

type StateProps = {
  index: number;
  testcase: Testcase;
};

type OwnProps = {
  workspaceLocation: WorkspaceLocation;
};

const SideContentTestcaseCard: React.FC<SideContentTestcaseCardProps> = props => {
  const { index, testcase, handleTestcaseEval } = props;

  const extraClasses = React.useMemo(() => {
    const isEvaluated = testcase.result !== undefined || testcase.errors;
    const isEqual = stringify(testcase.result) === testcase.answer;

    return {
      correct: isEvaluated && isEqual,
      wrong: isEvaluated && !isEqual,
      // opaque and secret testcases will be greyed in the GradingWorkspace
      secret: testcase.type === TestcaseTypes.secret || testcase.type === TestcaseTypes.opaque
    };
  }, [testcase]);

  const handleRunTestcase = React.useCallback(() => {
    handleTestcaseEval(index);
  }, [index, handleTestcaseEval]);

  /**
   * Note: There are 3 testcase types in the backend: public, opaque, secret
   *
   * Public testcases are always sent from the backend, and displayed for both
   * students and staff/ admin in the AssessmentWorkspace and/ or GradingWorkspace.
   *
   * Opaque testcases are always sent from the backend, and are 'hidden' with a
   * placeholder cell in the AssessmentWorkspace, but displayed in the
   * GradingWorkspace albeit with grey CSS styling.
   *
   * Secret testcases are only sent from the backend when the grading endpoint is
   * accessed (i.e. NOT sent in the AssessmentWorkspace). Thus they are only seen
   * in the GradingWorkspace albeit with grey CSS styling, which is only accessible
   * by staff/ admin.
   *
   * Extra info: The GitHubAssessmentWorkspace uses this testcase card component even
   * though they only have public testcases (as of July 2021). Thus all testcases will
   * be rendered in the GitHubAssessmentWorkspace for students.
   */
  return (
    <div className={classNames('AutograderCard', extraClasses)} data-testid="AutograderCard">
      <Card className={Classes.INTERACTIVE} elevation={Elevation.ONE} onClick={handleRunTestcase}>
        {testcase.type === TestcaseTypes.opaque && props.workspaceLocation === 'assessment' ? (
          // Render a placeholder cell in place of the actual testcase data for opaque testcases
          <Pre className="testcase-placeholder" data-testid="testcase-placeholder">
            Hidden testcase
          </Pre>
        ) : (
          <>
            <Pre className="testcase-program">{testcase.program}</Pre>
            <Pre className="testcase-expected">{testcase.answer}</Pre>
            <Pre className="testcase-actual" data-testid="testcase-actual">
              {testcase.errors
                ? parseError(testcase.errors)
                : testcase.result !== undefined
                  ? stringify(testcase.result)
                  : 'No Answer'}
            </Pre>
          </>
        )}
      </Card>
    </div>
  );
};

export default SideContentTestcaseCard;
