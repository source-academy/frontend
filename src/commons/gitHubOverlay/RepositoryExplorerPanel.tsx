import { Classes, Radio, RadioGroup } from '@blueprintjs/core';
import { useEffect } from 'react';

export const RepositoryExplorerPanel = (props: any) => {
  const { userRepos, repoName, setRepoName, refreshRepoFiles } = props;

  useEffect(() => {
    refreshRepoFiles();
  }, [repoName, refreshRepoFiles]);

  return (
    <div className={Classes.DIALOG_BODY}>
      <RadioGroup className='RepoPanel' onChange={setRepoName} selectedValue={repoName}>
        {userRepos.map((repo: any) => (
          <Radio label={repo.name} key={repo.id} value={repo.name} />
        ))}
      </RadioGroup>
    </div>
  );
};
