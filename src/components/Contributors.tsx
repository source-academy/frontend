import { Component } from 'react';
import * as React from 'react';

interface IContributorsState {
    key: number;
    photo: string;
    githubPage: string;
    githubName: string;
    commits: number;
}

interface IReposState {
    key: number;
    name: string;
    description: string;
    link: string;
}

interface IContributorsArrayState {
    ignoreRepos: string[];
    ignoreContributors: string[];
    repos: IReposState[];
    contributors: IContributorsState[];
}

class Contributors extends Component<{}, IContributorsArrayState> {
    
    constructor(props: any) {
        super(props);
    
        this.state = {
            ignoreRepos: ["sicp", "sharedb-ace-backend", "assessments", "tools", "source-academy2"],
            ignoreContributors: ["dependabot[bot]", "dependabot-preview[bot]"],
            repos: [],
            contributors: []
        };
    }

    public componentDidMount() {

        fetch('https://api.github.com/orgs/source-academy/repos')
        .then(results => {
            return results.json();
        })
        .then(repos => {
            const { ignoreRepos } = this.state;
            const contributorLinks = repos
                .filter((repo: any) => {
                    for (const repoName of ignoreRepos) {
                        if (repo.name === repoName) {
                            return false;
                        }
                    }
                    return true;
                })
                .map((repo: any) => {
                    return ({
                        key: repo.id,
                        name: repo.name,
                        description: repo.description,
                        link: repo.contributors_url
                    });
                });
            this.setState({
                repos: contributorLinks
            });
            return contributorLinks;
        })
        .then(endpoints => {
            Promise.all(
                endpoints.map((endpoint: any) => {
                    return fetch(endpoint.link);
                })
            )
            .then(responses => {
                return Promise.all( 
                    responses.map((res: any) => {
                        return res.json();
                    }) 
                );
            })
            .then(contributorsByRepo => {
                return Promise.all(
                    contributorsByRepo.map((contributors: any) => {
                        const { ignoreContributors } = this.state;
                        const contributorList = contributors
                            .filter((contributor: any) => {
                                for (const contributorName of ignoreContributors) {
                                    if (contributor.login === contributorName) {
                                        return false;
                                    }
                                }
                                return true;
                            })
                            .map((contributor: any) => {
                                return ({
                                    key: contributor.id,
                                    photo: contributor.avatar_url,
                                    githubPage: contributor.html_url,
                                    githubName: contributor.login,
                                    commits: contributor.contributions
                                });
                        });
                        this.setState({
                            contributors: [...this.state.contributors, contributorList]
                        });
                    })
                );
            });
            
        });
    }
      
    public render() {
        const { contributors, repos } = this.state;
        const contributorList = contributors.length ? (
            contributors.map((array: any, index: number) => {
                const repo = repos[index];
                const arrayMapped = array.map((contributor: IContributorsState) => {
                    return (
                        <div key={contributor.key}>
                            <img src={contributor.photo} alt="Image" height="200" width="200"/>
                            <p><a href={contributor.githubPage}>{contributor.githubName}</a></p>
                            <p>Number of commits: {contributor.commits}</p>
                        </div>
                    );
                });   
                return (
                    <div key={repo.key}>
                        <h2><u>{repo.name}</u></h2>
                        <h4>{repo.description}</h4>
                        <div>{arrayMapped}</div>
                    </div>
                );    
            })
        ) : (
            <h2>No contributors to the Source Academy yet!</h2>
        );
        return (
            <div>
                <h1>You committed!</h1>
                <p>Kudos to all our contributors to the Source Academy so far!</p>
                <div>{contributorList}</div>
            </div>
        );
    }
}

export default Contributors;