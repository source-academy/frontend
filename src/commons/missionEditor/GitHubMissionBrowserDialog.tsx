import { Button, Card, Classes, Dialog, Elevation, H4, Intent, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import Markdown from '../Markdown';
import Constants from '../utils/Constants';
import { getContentAsString, parseMetadataProperties } from './GitHubMissionDataUtils';

export type GitHubMissionBrowserDialogProps = {
  missionRepos: any[];
  onSubmit: (response: string) => void;
};

export const GitHubMissionBrowserDialog: React.FC<GitHubMissionBrowserDialogProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  const [browsableMissions, setBrowsableMissions] = useState<BrowsableMission[]>([]);

  useEffect(() => {
    convertMissionReposToBrowsableMissions(props.missionRepos, setBrowsableMissions);
  }, [props.missionRepos]);

  return (
    <Dialog className="missionBrowser" isOpen={true}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Select a Mission</h3>
      </div>

      <div className={Classes.DIALOG_BODY}>
        <div className="missionBrowserContent">
          {browsableMissions.map(missionRepo =>
            convertMissionToCard(missionRepo, isMobileBreakpoint, props.onSubmit)
          )}
        </div>
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

  function handleClose() {
    props.onSubmit('');
  }
};

class BrowsableMission {
  title: string = '';
  coverImage: string = '';
  webSummary: string = '';
  repositoryName: string = '';
}

async function convertMissionReposToBrowsableMissions(
  missionRepos: any[],
  setBrowsableMissions: any
) {
  const browsableMissions: BrowsableMission[] = [];

  for (let i = 0; i < missionRepos.length; i++) {
    browsableMissions.push(await convertRepoToBrowsableMission(missionRepos[i]));
  }

  setBrowsableMissions(browsableMissions);
}

async function convertRepoToBrowsableMission(missionRepo: any) {
  const octokit = getGitHubOctokitInstance() as Octokit;
  const authUser = await octokit.users.getAuthenticated();
  const loginId = authUser.data.login;

  const metadata = await getContentAsString(loginId, missionRepo.name, '/METADATA', octokit);
  const browsableMission = createBrowsableMission(missionRepo.name, metadata);

  return browsableMission;
}

function createBrowsableMission(repositoryName: string, metadata: string) {
  const browsableMission = new BrowsableMission();

  browsableMission.repositoryName = repositoryName;

  const propertiesToExtract = ['coverImage', 'title', 'webSummary'];

  const retVal = parseMetadataProperties<BrowsableMission>(
    browsableMission,
    propertiesToExtract,
    metadata
  );

  return retVal;
}

function convertMissionToCard(
  missionRepo: BrowsableMission,
  isMobileBreakpoint: boolean,
  onSubmit: any
) {
  const ratio = isMobileBreakpoint ? 5 : 3;

  return (
    <Card className="row listing" elevation={Elevation.ONE}>
      <div className={`col-xs-${String(ratio)} listing-picture`}>
        <img
          alt="Assessment"
          className={`cover-image-${missionRepo.title}`}
          src={missionRepo.coverImage ? missionRepo.coverImage : defaultCoverImage}
        />
      </div>

      <div className={`col-xs-${String(12 - ratio)} listing-text`}>
        <div className="listing-header">
          <Text ellipsize={true}>
            <H4 className="listing-title">{missionRepo.title}</H4>
          </Text>
        </div>

        <div className="listing-description">
          <Markdown content={missionRepo.webSummary} />
        </div>

        <div className="listing-footer">
          <div className="listing-button">
            <Button
              icon={IconNames.PLAY}
              minimal={true}
              // intentional: each listing renders its own version of onClick
              // tslint:disable-next-line:jsx-no-lambda
              onClick={() => {
                onSubmit(missionRepo.repositoryName);
              }}
            >
              <span className="custom-hidden-xxxs">Open</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
