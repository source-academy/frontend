import '@tremor/react/dist/esm/tremor.css';

import { Icon as BpIcon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import {
  Flex,
  // Footer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,  
  TextInput
} from '@tremor/react';
// import React, { useEffect, useState } from 'react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import Constants from 'src/commons/utils/Constants';
// import { getStories } from '../../features/stories/storiesComponents/BackendAccess';

const Stories: React.FC = () => {
  const [user, setUser] = useState<string>('');
  // const [data, setData] = useState<any[]>([]);
  
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
    { id: 'summary', header: 'Summary' }
  ];
  
  const fakeData = [
    { id: 1, author: 'Evangeline Blake', title: 'Try this hack to make your code faster', summary: 'Many people discuss about...' },
    { id: 2, author: 'Jasper Tan', title: 'Recursive Recursion Recursiveness', summary: 'Recursion may seem complex...' },
    { id: 3, author: 'Wei Zhang', title: 'i-i-i-terators', summary: 'What exactly are iterators...' },
    { id: 4, author: 'Ying Liu', title: 'Harnessing the Power of Object-Oriented Programming', summary: 'Object-Oriented Programming is...' },
    { id: 5, author: 'Ji-Yeon Kim', title: 'Debugging 101', summary: 'Bugs are extremely common...' },
    { id: 6, author: 'Wu Mei Ling', title: 'The Big-O Notion', summary: 'We will delve into understanding...' },
    { id: 7, author: 'Eugene Tan', title: 'BFS and DFS comparison', summary: 'What is BFS and DFS? Let us...' },
    { id: 8, author: 'Evangeline Blake', title: 'Try this hack to make your code faster', summary: 'Many people discuss about...' },
    { id: 9, author: 'Jasper Tan', title: 'Recursive Recursion Recursiveness', summary: 'Recursion may seem complex...' },
    { id: 10, author: 'Wei Zhang', title: 'i-i-i-terators', summary: 'What exactly are iterators...' },
    { id: 11, author: 'Ying Liu', title: 'Harnessing the Power of Object-Oriented Programming', summary: 'Object-Oriented Programming is...' },
    { id: 12, author: 'Ji-Yeon Kim', title: 'Debugging 101', summary: 'Bugs are extremely common...' },
    { id: 13, author: 'Wu Mei Ling', title: 'The Big-O Notion', summary: 'We will delve into understanding...' },
    { id: 14, author: 'Eugene Tan', title: 'BFS and DFS comparison', summary: 'What is BFS and DFS? Let us...' }
  ];
  

  // useEffect(() => {
  //   getStories().then(res => {
  //     res?.json().then(r2 => {
  //       console.log(r2.data);
  //       setData(r2.data);
  //     });
  //   });
  // }, []);

  return (
    <div className="storiesHome">
      
      <div className="storiesInteract">
      <Flex marginTop="mt-2" justifyContent="justify-between" alignItems="items-center">

      <button className="storiesButton" onClick={handleSubmit}>
        + Add Story
        </button>

      <form onSubmit={handleSubmit}>
      <div >
      <div>
      <TextInput
          maxWidth="max-w-xl"
          icon={() => <BpIcon icon={IconNames.SEARCH} style={{ marginLeft: '0.75rem' }} />}
          placeholder="Search for stories..."
          onChange={e => setUser(e.target.value)}
          value={user}
        />
        </div>
      </div>
    </form>
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
      </div>
     
    <div>
    <div style={{padding: "0px 50px 0px 50px"}}>
      <Table marginTop="mt-10">
        <TableHead>
          <TableRow >
            {columns.map(column => (
                <TableHeaderCell key={column.id}>{column.header}</TableHeaderCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody >
          {fakeData.map((item) => (
            <TableRow key={item.id} >
              <TableCell >{item.author}</TableCell>
              <TableCell>
                <Text>{item.title}</Text>
              </TableCell>
              <TableCell>
                <Text>{item.summary}</Text>
              </TableCell>
              {/* <TableCell>
                <Badge color="emerald" icon={StatusOnlineIcon}>
                  {item.status}
                </Badge>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
</div>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Stories;
Component.displayName = 'Stories';

export default Stories;
