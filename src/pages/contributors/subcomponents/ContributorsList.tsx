import { Card, Elevation, H2, H3, H5 } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';

import type { Contributor } from '../../../features/contributors/ContributorsTypes';
import { queries } from '../../../queryKeys';

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
        <div
          key={contributor.key}
          className="my-1 w-[10%] min-w-25 align-top text-center sm:w-[16%] md:w-[12%] lg:w-[8%]"
        >
          <img
            src={contributor.photo}
            alt="Contributor"
            className="mx-auto aspect-square w-12 rounded-full object-cover md:w-14"
          />
          <p className="mb-[0.2rem] text-(--cadet-color-2)">
            <a
              href={contributor.githubPage}
              rel="noopener noreferrer"
              target="_blank"
              className="font-bold text-(--cadet-color-1) no-underline hover:text-(--cadet-color-3)"
            >
              {contributor.githubName}
            </a>
          </p>
          <p className="mb-[0.2rem] text-(--cadet-color-2)">Commits: {contributor.commits}</p>
        </div>
      );
    });
    return (
      <Card key={repo.key} className="mb-[2%] bg-(--cadet-color-4)" elevation={Elevation.ONE}>
        <div className="text-center">
          <H3 className="mx-[2%] mb-[0.5%] text-(--cadet-color-2) first-letter:uppercase">
            {repo.name}
          </H3>
          <H5 className="mx-[2%] mb-[1%] italic text-(--cadet-color-1)">{repo.description}</H5>
        </div>
        <div className="bg-(--cadet-color-4) justify-center flex flex-wrap gap-2">
          {arrayMapped}
        </div>
      </Card>
    );
  });

  return contributorList;
}

export default ContributorsList;
