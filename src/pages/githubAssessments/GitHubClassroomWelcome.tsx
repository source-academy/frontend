import { H2, H4, UL } from '@blueprintjs/core';

import ContentDisplay from '../../commons/ContentDisplay';

const GitHubClassroomWelcome: React.FC = () => {
  const content = (
    <div>
      <H2>Welcome to Source Academy with GitHub Classroom!</H2>
      <br />
      <H4>Source Academy does not find any course information for this account.</H4>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <UL style={{ textAlign: 'justify', width: '60%' }}>
          <li>
            If you are enrolled in a Source Academy course that uses GitHub Classroom, check with
            the course staff to make sure your account is added to the course.
          </li>
          <li>
            If you are looking for a course to join, check{' '}
            <a href="https://github.com/source-academy/general/blob/master/learner/README.md">
              here
            </a>{' '}
            to find a course that suits your needs.
          </li>
        </UL>
      </div>
    </div>
  );
  return <ContentDisplay display={content} loadContentDispatch={() => {}} />;
};

export default GitHubClassroomWelcome;
