import { Card, Elevation, H2, H3, H5 } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import classes from 'src/styles/Contributors.module.scss';

import { Contributor, Repo } from '../../../features/contributors/ContributorsTypes';
import { fetchContributors, fetchRepos } from './ContributorsGithubApi';

const ContributorsList: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [contributors, setContributors] = useState<Contributor[][]>([]);

  useEffect(() => {
    fetchRepos().then((repos: Repo[]) => {
      fetchContributors(repos).then((contributors: Contributor[][]) => {
        setRepos(repos);
        setContributors(contributors);
      });
    });
  }, []);

  const contributorList = contributors.length ? (
    contributors.map((array: Contributor[], index: number) => {
      const repo = repos[index];
      const arrayMapped = array.map((contributor: Contributor) => {
        return (
          <div key={contributor.key}>
            <img src={contributor.photo} alt="Contributor" />
            <p>
              <a href={contributor.githubPage} rel="noopener noreferrer" target="_blank">
                {contributor.githubName}
              </a>
            </p>
            <p>Commits: {contributor.commits}</p>
          </div>
        );
      });
      return (
        <Card key={repo.key} className={classes['containerPermalink']} elevation={Elevation.ONE}>
          <div className={classes['repoDetailsPermalink']}>
            <H3>{repo.name}</H3>
            <H5>{repo.description}</H5>
          </div>
          <div className={classes['inPermalink']}>{arrayMapped}</div>
        </Card>
      );
    })
  ) : (
    <H2>Loading...</H2>
  );
  return <div>{contributorList}</div>;
};

export default ContributorsList;
