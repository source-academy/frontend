import { Classes, Radio, RadioGroup } from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect } from 'react';

export const RepositoryExplorerPanel = (props: any) => {
  const { userRepos, repoName, setRepoName, setRepoFiles } = props;

  useEffect(() => {
    setRepoFiles();
  }, [repoName, setRepoFiles]);

  return (
    <div className={classNames(Classes.DIALOG_BODY, 'repo-step')}>
      <RadioGroup onChange={setRepoName} selectedValue={repoName}>
        {userRepos.map((repo: any) => (
          <Radio label={repo.name} key={repo.id} value={repo.name} />
        ))}
      </RadioGroup>
    </div>
  );
};
