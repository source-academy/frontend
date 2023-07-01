import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GithubGetRepoRespData } from 'src/features/github/GitHubTypes';

import { getFilesFromStoryRepo } from '../../features/github/GitHubUtils';

function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
}

//const DIRECTORY = 'dir';
const FILE = 'file';
const MARKDOWN = 'md';

const UserBlogDir: React.FC = () => {
  const { user } = useParams<{ user: string }>();
  const [repoData, setRepoData] = useState<GithubGetRepoRespData[]>([]);
  useEffect(() => {
    getFilesFromStoryRepo(user!).then(res => {
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

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = UserBlogDir;
Component.displayName = 'UserBlogDir';

export default UserBlogDir;
