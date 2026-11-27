import { H2, UL } from '@blueprintjs/core';
import Constants, { Links } from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';
import ItalicLink from 'src/commons/utils/ItalicLink';
import { PageCard, PageWrapper } from 'src/components/ui/page';

function WelcomePage() {
  const { name } = useSession();

  const { sourceAcademyDeploymentName } = Constants;
  return (
    <PageWrapper>
      <PageCard>
        <H2>Welcome to {sourceAcademyDeploymentName}</H2>
        <div>
          You have logged in as <strong>{name}</strong>. {sourceAcademyDeploymentName} does not have
          any course information for this account
        </div>
        <UL className="text-left">
          <li>
            If you are enrolled in a course, check with the course staff to make sure your account
            is added to the course.
          </li>
          <li>
            Click <ItalicLink href={Links.resourcesForLearners}>here</ItalicLink> to find a course
            that suits your needs.
          </li>
          <li>
            Click <ItalicLink href={Links.resourcesForEducators}>here</ItalicLink> for a list of
            resources to get started.
          </li>
        </UL>
      </PageCard>
    </PageWrapper>
  );
}

export const Component = WelcomePage;
