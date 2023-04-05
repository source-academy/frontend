import { useEffect, useState } from 'react';
import { RouteComponentProps, useParams } from 'react-router-dom';
import { GithubGetRepoRespData } from 'src/features/github/GitHubTypes';

import { getFilesFromStoryRepo } from '../../features/github/GitHubUtils';

function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
}

//const DIRECTORY = 'dir';
const FILE = 'file';
const MARKDOWN = 'md';

type UserBlogDirProps = RouteComponentProps<{}>;

const UserBlogDir: React.FC<UserBlogDirProps> = () => {
  const { user } = useParams<{ user: string }>();
  const [repoData, setRepoData] = useState<GithubGetRepoRespData[]>([]);
  useEffect(() => {
    getFilesFromStoryRepo(user).then(res => {
      setRepoData(res);
    });
  }, [user]);
  return (
    <div className="userblog">
      <div className="path">
        <h1>{user}</h1>
      </div>
      <div className="userblogDir">
        <div className="repoList">
          <p className="titleText">Posts</p>
          <hr />
          {repoData.map(item => {
            if (item.type === FILE && getFileExtension(item.name) === MARKDOWN) {
              return (
                <p key={item.name}>
                  <a href={`/stories/view/${user}/${item.name}`}>{item.name}</a>
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default UserBlogDir;
