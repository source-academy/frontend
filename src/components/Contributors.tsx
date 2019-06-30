import * as React from 'react';

type Contributor = {
    key: number;
    photo: string;
    githubPage: string;
    githubName: string;
    commits: number;
};

type Repo = {
    key: number;
    name: string;
    description: string;
    link: string;
};

type ContributorsState = {
    repos: Repo[];
    contributors: Contributor[][];
};

class Contributors extends React.Component<{}, ContributorsState> {
    
    private readonly ignoreRepos: string[] = ["sicp", "assessments", "tools", "source-academy2"];
    private readonly ignoreContributors: string[] = ["dependabot[bot]", "dependabot-preview[bot]"];

    constructor(props: {}) {
        super(props);

        this.state = {
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
            const { ignoreRepos } = this;
            const contributorLinks = repos
                .filter((repo: any) => {
                    return !ignoreRepos.includes(repo.name);
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
                        const { ignoreContributors } = this;
                        const contributorList = contributors
                            .filter((contributor: any) => {
                                return !ignoreContributors.includes(contributor.login);
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
                const arrayMapped = array.map((contributor: Contributor) => {
                    return (
                        <div key={contributor.key}>
                            <img src={contributor.photo} alt="Image" />
                            <p><a href={contributor.githubPage} target="_blank">{contributor.githubName}</a></p>
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
                        <div className="inPermalink">
                            {arrayMapped}
                        </div>
                    </div>
                );    
            })
        ) : (
            <h2>Loading...</h2>
        );
        return (
            <div>
                {contributorList}
            </div>
        );
    }
}

export default Contributors;