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
                            <p><a href={contributor.githubPage} target="_blank">{contributor.githubName}</a></p>
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
            <h2>Loading...</h2>
        );
        return (
            <div>
                <h1>Meet our Contributors!</h1>
                <h2>Special thanks to...</h2>
                <ul>
                    <li>XXX - the architect behind the Source Academy</li>
                    <li>XXX - who have made the module's textbook ever better and more interactive</li>
                    <li>All our Avengers and tutors from the current and past iterations of the module</li>
                </ul>
                <h2>Our Developers</h2>
                <p>The people who have...</p>
                <ul>
                    <li>Project Managers: Martin Henz, Evan Sebastian</li>
                    <li>Frontend Team: Vignesh Shankar, Lee Ning Yuan, Rahul Rajesh</li>
                    <li>Backend Team: Julius Putra Tanu Setiaji, Chen Shaowei, Liow Jia Chen</li>
                    <li>Artistic Team: Ng Tse Pei, Joey Yeo, Tan Yu Wei</li>
                </ul>
                <h2>You committed!</h2>
                <p>To thank all those who have contributed (and continue to contribute) to the development of the Source Academy under these various teams via Github! 
                    Kudos to all our contributors to the Source Academy so far!</p>
                <div>{contributorList}</div>
                <h2>You can contribute too!</h2>
                <p>What are you waiting for? Head down over to our source code on Github and make your first commit!</p>
            </div>
        );
    }
}

export default Contributors;