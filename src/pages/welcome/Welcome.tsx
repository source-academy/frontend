import { Card, H2, UL } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import Constants, { Links } from 'src/commons/utils/Constants';
import { useSession } from 'src/commons/utils/Hooks';

import styles from './Welcome.module.scss';

const Welcome: React.FC = () => {
  const { t } = useTranslation();
  const { name } = useSession();

  return (
    <div className="fullpage">
      <Card className="fullpage-content">
        <div className={styles.fullpage}>
          <div>
            <H2>
              {t('welcome.title', {
                sourceAcademyDeploymentName: Constants.sourceAcademyDeploymentName
              })}
            </H2>
            <div>
              {t('welcome.loggedInMessage', {
                name,
                sourceAcademyDeploymentName: Constants.sourceAcademyDeploymentName
              })}
            </div>
            <div className={styles['fullpage-content']}>
              <UL className={styles['text-left']}>
                <li>
                  {t('welcome.resourcesForLearners', {
                    resourcesForLearners: Links.resourcesForLearners
                  })}
                </li>
                <li>
                  {t('welcome.resourcesForEducators', {
                    resourcesForEducators: Links.resourcesForEducators
                  })}
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
