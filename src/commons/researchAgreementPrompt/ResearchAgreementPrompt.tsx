import { Button, Classes, Dialog, DialogBody, DialogFooter, H4, Intent } from '@blueprintjs/core';
import { useDispatch } from 'react-redux';

import SessionActions from '../application/actions/SessionActions';
import Constants from '../utils/Constants';

const ResearchAgreementPrompt: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <div className="research-prompt">
      <Dialog
        className={Classes.DARK}
        title="Agreement to Participate in Educational Research"
        canOutsideClickClose={false}
        canEscapeKeyClose={false}
        isCloseButtonShown={false}
        isOpen
      >
        <DialogBody>
          <H4>Welcome to your new {Constants.sourceAcademyDeploymentName} course!</H4>
          <div>
            Here at {Constants.sourceAcademyDeploymentName}, our mission is to bring out the beauty
            and fun in programming and the ideas behind programming, and to make these ideas
            universally accessible. This includes educational research!
          </div>
          <br />
          <div>
            We collect programs that students run in {Constants.sourceAcademyDeploymentName} and
            store them anonymously for our research. You are free to opt out of this collection,
            with no penalty for you whatsoever. Contact your course instructor if you have questions
            or concerns about this research.
          </div>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                text="I would like to opt out"
                onClick={() => dispatch(SessionActions.updateCourseResearchAgreement(false))}
              />
              <Button
                text="I consent!"
                intent={Intent.SUCCESS}
                onClick={() => dispatch(SessionActions.updateCourseResearchAgreement(true))}
              />
            </>
          }
        />
      </Dialog>
    </div>
  );
};

export default ResearchAgreementPrompt;
