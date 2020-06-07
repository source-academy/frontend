import { Card, Elevation } from '@blueprintjs/core';
import { H2, H3, H5 } from '@blueprintjs/core';
import * as React from 'react';

import {
  Contributor,
  ContributorsState,
  Repo
} from '../../../features/contributors/ContributorsTypes';
import { fetchContributors, fetchRepos } from './ContributorsGithubApi';

class ContributorsList extends React.Component<{}, ContributorsState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      repos: [],
      contributors: []
    };
  }

  public componentDidMount() {
    fetchRepos()
      .then((repos: Repo[]) => {
        this.setState({
          repos
        });
        return repos;
      })
      .then((repos: Repo[]) => {
        fetchContributors(repos).then((contributors: Contributor[][]) => {
          this.setState({
            contributors
          });
        });
      });
  }

  public render() {
    const { contributors, repos } = this.state;
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
          <Card key={repo.key} className="containerPermalink" elevation={Elevation.ONE}>
            <div className="repoDetailsPermalink">
              <H3>{repo.name}</H3>
              <H5>{repo.description}</H5>
            </div>
            <div className="inPermalink">{arrayMapped}</div>
          </Card>
        );
      })
    ) : (
      <H2>Loading...</H2>
    );
    return <div>{contributorList}</div>;
  }
}

export default ContributorsList;
