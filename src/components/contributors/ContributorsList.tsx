import * as React from 'react';

import { Contributor, ContributorsState, Repo } from './ContributorsTypes';
import { fetchContributors, fetchRepos } from './GithubApi';

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
              <img src={contributor.photo} alt="Image" />
              <p>
                <a href={contributor.githubPage} target="_blank">
                  {contributor.githubName}
                </a>
              </p>
              <p>Commits: {contributor.commits}</p>
            </div>
          );
        });
        return (
          <div key={repo.key} className="containerPermalink">
            <div className="repoDetailsPermalink">
              <h3>{repo.name}</h3>
              <h5>{repo.description}</h5>
            </div>
            <div className="inPermalink">{arrayMapped}</div>
          </div>
        );
      })
    ) : (
      <h2>Loading...</h2>
    );
    return <div>{contributorList}</div>;
  }
}

export default ContributorsList;
