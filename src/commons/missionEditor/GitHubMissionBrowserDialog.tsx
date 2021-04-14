import { Button, Card, Classes, Dialog, Elevation, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React from 'react';
import { useMediaQuery } from 'react-responsive';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import Markdown from '../Markdown';
import NotificationBadge from '../notificationBadge/NotificationBadgeContainer';
import { filterNotificationsByAssessment } from '../notificationBadge/NotificationBadgeHelper';
import Constants from '../utils/Constants';

const GitHubMissionBrowserDialog: React.FC<any> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const allRepos = [];
  const foundMissions = allRepos.filter(checkIfRepositoryIsMission);

  return (
    <Dialog className="missionBrowserDialog" isOpen={true}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Select a Mission</h3>
      </div>

      <div className={Classes.DIALOG_BODY}>
        {foundMissions.map(missionRepo => convertMissionToCard(missionRepo, isMobileBreakpoint))}
      </div>

      <div className={classNames(Classes.DIALOG_FOOTER)}>
        <div className={classNames(Classes.DIALOG_FOOTER_ACTIONS)}>
          <Button onClick={handleClose} intent={Intent.PRIMARY}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );

  function handleClose() {}
};

function checkIfRepositoryIsMission(repo: any) {
  return true;
}

function convertMissionToCard(missionRepo: any, isMobileBreakpoint: boolean) {
  const ratio = isMobileBreakpoint ? 5 : 3;

  return (
    <Card className="row listing" elevation={Elevation.ONE}>
      <div className={`col-xs-${String(ratio)} listing-picture`}>
        <NotificationBadge
          className="badge"
          notificationFilter={filterNotificationsByAssessment(missionRepo.id)}
          large={true}
        />
        <img
          alt="Assessment"
          className={`cover-image-${missionRepo.status}`}
          src={missionRepo.coverImage ? missionRepo.coverImage : defaultCoverImage}
        />
      </div>

      <div className="listing-description">
        <Markdown content={missionRepo.shortSummary} />
      </div>

      <div className="listing-footer">
        <div className="listing-button">
          <Button
            icon={IconNames.PLAY}
            minimal={true}
            // intentional: each listing renders its own version of onClick
            // tslint:disable-next-line:jsx-no-lambda
            onClick={() => {
              console.log('PAIN PEKO');
            }}
          >
            <span className="custom-hidden-xxxs">Open</span>
          </Button>
        </div>
      </div>
    </Card>
  );

  //return <div>pain</div>;
}

export default GitHubMissionBrowserDialog;
