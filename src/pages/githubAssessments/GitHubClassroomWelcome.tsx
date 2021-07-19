import { Card, H2, H4, UL } from '@blueprintjs/core';

const GitHubClassroomWelcome: React.FC = () => {
  return (
    <div className="github-welcome">
      <Card className="github-welcome-content">
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <div>
            <H2>Welcome to Source Academy with GitHub Classroom!</H2>
            <br />
            <H4>Source Academy does not find any course information for this account.</H4>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <UL style={{ textAlign: 'justify' }}>
                <li>
                  If you are enrolled in a Source Academy course that uses GitHub Classroom, check
                  with the course staff to make sure your account is added to the course.
                </li>
                <li>
                  If you are looking for a course to join, check{' '}
                  <a href="https://about.sourceacademy.org/learner/README.html">here</a> to find a
                  course that suits your needs.
                </li>
              </UL>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GitHubClassroomWelcome;
