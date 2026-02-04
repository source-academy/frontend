import { Card, H2, UL } from '@blueprintjs/core';
import { Trans, useTranslation } from 'react-i18next';
import { ItalicLink } from 'src/commons/sideContent/content/SideContentCseMachine';
import Constants, { Links } from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';

import styles from './Welcome.module.scss';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const { name } = useSession();

  const { sourceAcademyDeploymentName } = Constants;
  return (
    <div className="fullpage">
      <Card className="fullpage-content">
        <div className={styles.fullpage}>
          <div>
            <H2>{t('welcome.title', { sourceAcademyDeploymentName })}</H2>
            <div>
              <Trans
                i18nKey="welcome.loggedInMessage"
                components={[<strong />]}
                tOptions={{ name, sourceAcademyDeploymentName }}
              />
            </div>
            <div className={styles['fullpage-content']}>
              <UL className={styles['text-left']}>
                <li>{t('welcome.enrollmentMessage')}</li>
                <li>
                  <Trans
                    i18nKey="welcome.resourcesForLearners"
                    components={[<ItalicLink href={Links.resourcesForLearners} />]}
                  />
                </li>
                <li>
                  <Trans
                    i18nKey="welcome.resourcesForEducators"
                    components={[<ItalicLink href={Links.resourcesForEducators} />]}
                  />
                </li>
              </UL>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Welcome;
Component.displayName = 'Welcome';

export default Welcome;
