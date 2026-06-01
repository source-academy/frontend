import { Card, H2, UL } from '@blueprintjs/core';
import { Trans, useTranslation } from 'react-i18next';
import { ItalicLink } from 'src/commons/sideContent/content/SideContentCseMachine';
import Constants, { Links } from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';

function WelcomePage() {
  const { t } = useTranslation();
  const { name } = useSession();

  const { sourceAcademyDeploymentName } = Constants;
  return (
    <div className="fullpage">
      <Card className="fullpage-content">
        <div>
          <H2>{t($ => $.welcome.title, { sourceAcademyDeploymentName })}</H2>
          <div>
            <Trans
              i18nKey={$ => $.welcome.loggedInMessage}
              // eslint-disable-next-line react/jsx-key
              components={[<strong />]}
              tOptions={{ name, sourceAcademyDeploymentName }}
            />
          </div>
          <UL className="text-left">
            <li>{t($ => $.welcome.enrollmentMessage)}</li>
            <li>
              <Trans
                i18nKey={$ => $.welcome.resourcesForLearners}
                // eslint-disable-next-line react/jsx-key
                components={[<ItalicLink href={Links.resourcesForLearners} />]}
              />
            </li>
            <li>
              <Trans
                i18nKey={$ => $.welcome.resourcesForEducators}
                // eslint-disable-next-line react/jsx-key
                components={[<ItalicLink href={Links.resourcesForEducators} />]}
              />
            </li>
          </UL>
        </div>
      </Card>
    </div>
  );
}

export const Component = WelcomePage;
