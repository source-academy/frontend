import { Card, Elevation, H2, H3, H5 } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';

import type { Contributor } from '../../../features/contributors/ContributorsTypes';
import { queries } from '../../../queryKeys';
import classes from './Contributors.module.css';

function ContributorsList() {
  const {
    data: repos,
    isLoading: isReposLoading,
    error: reposError,
  } = useQuery(queries.contributors.repos);

  const {
    data: contributors,
    isLoading: isContributorsLoading,
    error: contributorsError,
  } = useQuery({
    ...queries.contributors.contributors(repos ?? []),
    enabled: !!repos && repos.length > 0,
  });

  if (isReposLoading || isContributorsLoading) {
    return <H2>Loading...</H2>;
  }

  if (reposError || contributorsError) {
    return <H2>Error loading contributors</H2>;
  }

  if (!repos?.length || !contributors?.length) {
    return <H2>No contributors found</H2>;
  }

  const contributorList = contributors.map((array: Contributor[], index: number) => {
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
  });

  return <div>{contributorList}</div>;
}

export default ContributorsList;
