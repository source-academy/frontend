import { Card, H2, UL } from '@blueprintjs/core';
import Constants, { Links } from 'src/commons/utils/Constants';
import { useTypedSelector } from 'src/commons/utils/Hooks';

const Welcome: React.FC = () => {
  const name = useTypedSelector(store => store.session.name);

  return (
    <div className="fullpage">
      <Card className="fullpage-content">
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <div>
            <H2>Welcome to {Constants.sourceAcademyDeploymentName}</H2>
            <div>
              You have logged in as <strong>{name}</strong>. {Constants.sourceAcademyDeploymentName}{' '}
              does not have any course information for this account.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <UL style={{ textAlign: 'left' }}>
                <li>
                  If you are enrolled in a course, check with the course staff to make sure your
                  account is added to the course.
                </li>
                <li>
                  If you are looking for a course to join, check{' '}
                  <a href={Links.resourcesForLearners}>here</a> to find a course that suits your
                  needs.
                </li>
                <li>
                  If you are an instructor and want to create a course, click{' '}
                  <a href={Links.resourcesForEducators}>here</a> for a list of resources to get
                  started.
                </li>
              </UL>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;
