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

export interface IContributorsProps extends IDispatchProps, IStateProps {}

export interface IStateProps {
    repos: Repo[];
    contributors: Contributor[][];
}

export interface IDispatchProps {
    handleFetchRepos: () => void;
}

class Contributors extends React.Component<IContributorsProps, {}> {
    
    constructor(props: IContributorsProps) {
        super(props);
    }

    public componentDidMount() {
        this.props.handleFetchRepos();
    }
      
    public render() {
        const { contributors, repos } = this.props;
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
                    <div key={repo.key}>
                        <div className="repoDetailsPopup">
                            <h3>{repo.name}</h3>
                            <h5>{repo.description}</h5>
                        </div>
                        <div className="inPopup">
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