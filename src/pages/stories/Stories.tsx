import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Constants from 'src/commons/utils/Constants';

import { getStories } from '../../features/stories/storiesComponents/BackendAccess';

const Stories = () => {
  const [user, setUser] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setUser(e.currentTarget.value);
  };
  const history = useHistory();
  const handleSubmit = (): void => {
    if (user !== '') {
      history.push(`/stories/view/${user}`);
    }
  };

  useEffect(() => {
    getStories().then(res => {
      res?.json().then(r2 => {
        console.log(r2.data);
        setData(r2.data);
      });
    });
  }, []);

  return (
    <div className="storiesHome">
      <div className="storiesInteract">
        <p className="titleText">Stories</p>
        <form onSubmit={handleSubmit}>
          <input
            className="storiesInput"
            type="text"
            placeholder="GitHub username here"
            value={user}
            onChange={onChange}
            required
          />
        </form>
        <button className="storiesButton" onClick={handleSubmit}>
          Explore user's blogs
        </button>
        <p>
          <a href={`/stories/new`}>Write your own</a> story!
        </p>
        {Constants.storiesBackendUrl && (
          <div>
            <p className="titleText">Recent Posts</p>
            <div className="recent">
              {data.map(user => (
                <div>
                  <p className="postTitle">
                    <a href={`/stories/view/${user.githubname}/${user.filename}`}>
                      {user.filename}
                    </a>
                  </p>
                  <p className="postUser">
                    by <a href={`/stories/view/${user.githubname}`}>{user.githubname}</a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Stories;
Component.displayName = 'Stories';

export default Stories;
