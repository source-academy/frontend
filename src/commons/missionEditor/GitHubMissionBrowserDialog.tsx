import { Button, Card, Classes, Dialog, Elevation, H4, H6, Intent, Text } from '@blueprintjs/core';
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
import MissionRepoData from './MissionRepoData';

export type GitHubMissionBrowserDialogProps = {
  missionRepos: MissionRepoData[];
  resolveDialog: (response: MissionRepoData) => void;
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
            convertMissionToCard(missionRepo, isMobileBreakpoint, props.resolveDialog)
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
    props.resolveDialog(new MissionRepoData('', ''));
  }
};

class BrowsableMission {
  title: string = '';
  coverImage: string = '';
  webSummary: string = '';
  missionRepoData: MissionRepoData = new MissionRepoData('', '');
}

async function convertMissionReposToBrowsableMissions(
  missionRepos: MissionRepoData[],
  setBrowsableMissions: any
) {
  const browsableMissions: BrowsableMission[] = [];

  for (let i = 0; i < missionRepos.length; i++) {
    browsableMissions.push(await convertRepoToBrowsableMission(missionRepos[i]));
  }

  setBrowsableMissions(browsableMissions);
}

async function convertRepoToBrowsableMission(missionRepo: MissionRepoData) {
  const octokit = getGitHubOctokitInstance() as Octokit;
  const metadata = await getContentAsString(
    missionRepo.repoOwner,
    missionRepo.repoName,
    '/METADATA',
    octokit
  );
  const browsableMission = createBrowsableMission(missionRepo, metadata);

  return browsableMission;
}

function createBrowsableMission(missionRepo: MissionRepoData, metadata: string) {
  const browsableMission = new BrowsableMission();

  browsableMission.missionRepoData = missionRepo;

  const propertiesToExtract = ['coverImage', 'title', 'webSummary'];

  const retVal = parseMetadataProperties<BrowsableMission>(
    browsableMission,
    propertiesToExtract,
    [],
    metadata
  );

  return retVal;
}

function convertMissionToCard(
  missionRepo: BrowsableMission,
  isMobileBreakpoint: boolean,
  resolveDialog: (response: MissionRepoData) => void
) {
  const ratio = isMobileBreakpoint ? 5 : 3;
  const ownerSlashName =
    missionRepo.missionRepoData.repoOwner + '/' + missionRepo.missionRepoData.repoName;

  return (
    <Card key={ownerSlashName} className="row listing" elevation={Elevation.ONE}>
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
            <H6>{ownerSlashName}</H6>
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
                resolveDialog(missionRepo.missionRepoData);
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
