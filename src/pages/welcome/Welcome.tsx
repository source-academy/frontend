import { Card, H2, UL } from '@blueprintjs/core';

export type WelcomeProps = StateProps;

export type StateProps = {
  name?: string;
};

const Welcome: React.FC<WelcomeProps> = props => {
  return (
    <div className="fullpage">
      <Card className="fullpage-content">
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <div>
            <H2>Welcome to Source Academy @ NUS</H2>
            <div>
              You have logged in as <strong>{props.name}</strong>. Source Academy @ NUS does not
              have any course information for this account.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <UL style={{ textAlign: 'left' }}>
                <li>
                  If you are enrolled in a course, check with the course staff to make sure your
                  account is added to the course.
                </li>
                <li>
                  If you are looking for a course to join, check{' '}
                  <a href="https://github.com/source-academy/general/blob/master/learner/README.md">
                    here
                  </a>{' '}
                  to find a course that suits your needs.
                </li>
                <li>If you are an instructor and want to create a course, #TODO</li>
              </UL>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;
