import '@tremor/react/dist/esm/tremor.css';

import { Button as BpButton, Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
  Card,
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
  Title
} from '@tremor/react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// import Constants from 'src/commons/utils/Constants';
import { getStories } from '../../features/stories/storiesComponents/BackendAccess';

const Stories: React.FC = () => {
  // const [user, setUser] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  // const [query, setQuery] = useState('');

  const navigate = useNavigate();
  const handleSubmit = (): void => {
    navigate(`/stories/new`);
  };

  // const handleSubmitUser = (): void => {
  //   if (user !== '') {
  //     navigate(`/stories/view/${user}`);
  //   }
  // };

  const columns = [
    { id: 'author', header: 'Author' },
    { id: 'title', header: 'Title' },
    { id: 'content', header: 'Content' },
    { id: 'actions', header: 'Actions' }
  ];

  useEffect(() => {
    getStories().then(res => {
      res?.json().then(r2 => {
        console.log(r2);
        setData(r2);
      });
    });
  }, []);

  return (
    <div className="storiesHome">
      <Card>
        <Flex justifyContent="justify-between">
          <Flex justifyContent="justify-start" spaceX="space-x-6">
            <Title>All Stories</Title>
            <BpButton onClick={handleSubmit} icon={IconNames.PLUS}>
              Add Story
            </BpButton>
          </Flex>
          <TextInput
            maxWidth="max-w-xl"
            icon={() => <BpIcon icon={IconNames.SEARCH} style={{ marginLeft: '0.75rem' }} />}
            placeholder="Search for author..."
            // onChange={e => setQuery(e.target.value)}
          />
        </Flex>
        {/* {Constants.storiesBackendUrl && (
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
        )} */}

        <div style={{ padding: '0px 50px 0px 50px' }}>
          <Table marginTop="mt-10">
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableHeaderCell key={column.id}>{column.header}</TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                // .filter(story => story.authorId.toLowerCase().includes(query)
                .map(story => (
                  <TableRow key={story.id}>
                    <TableCell>{story.authorId}</TableCell>
                    <TableCell>
                      <Text>{story.title}</Text>
                    </TableCell>
                    <TableCell>
                      <Text>
                        {story.content.length > 35
                          ? `${story.content.substring(0, 35)} ...`
                          : story.content}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Flex spaceX="space-x-2">
                        <Link to={`/stories/view`}>
                          <Icon
                            tooltip="View"
                            icon={() => <BpIcon icon={IconNames.EyeOpen} />}
                            variant="light"
                          />
                        </Link>
                        <Link to={`/stories/edit`}>
                          <Icon
                            tooltip="Edit"
                            icon={() => <BpIcon icon={IconNames.EDIT} />}
                            variant="light"
                          />
                        </Link>
                      </Flex>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Stories;
Component.displayName = 'Stories';

export default Stories;
