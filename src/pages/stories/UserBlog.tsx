import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getStory } from '../../features/github/GitHubUtils';
import UserBlogContent from '../../features/stories/storiesComponents/UserBlogContent';

const UserBlog: React.FC = () => {
  const { fileName } = useParams<{ fileName: string }>();
  const { user } = useParams<{ user: string }>();
  const [content, setContent] = useState<string | null>('');

  useEffect(() => {
    getStory(user, fileName).then(res => {
      setContent(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="userblog">
      <div className="path">
        <h1>
          <a href={`/stories/view/${user}`}>{user}</a> / {fileName}
        </h1>
      </div>
      <UserBlogContent fileContent={content} />
    </div>
  );
};

export default UserBlog;
