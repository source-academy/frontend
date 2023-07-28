import { Icon as BpIcon } from '@blueprintjs/core/lib/esm/components/icon/icon';
import { IconNames } from '@blueprintjs/icons';
import {
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text
} from '@tremor/react';
import React from 'react';
import { StoryListView } from 'src/features/stories/StoriesTypes';

type Props = {
  headers: Array<{ id: string; header: string }>;
  stories: StoryListView[];
  storyActions: (stor: StoryListView) => React.ReactNode;
};

const MAX_EXCERPT_LENGTH = 35;

const StoriesTable: React.FC<Props> = ({ headers, stories, storyActions }) => {
  return (
    <Table marginTop="mt-10">
      <TableHead>
        <TableRow>
          {headers.map(({ id, header }) => (
            <TableHeaderCell key={id}>{header}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {stories.map(story => {
          const { id, authorName, isPinned, title, content } = story;
          return (
            <TableRow key={id}>
              <TableCell>{authorName}</TableCell>
              <TableCell>
                <Flex justifyContent="justify-start">
                  {isPinned && <Icon icon={() => <BpIcon icon={IconNames.PIN} />} />}
                  <Text>{title}</Text>
                </Flex>
              </TableCell>
              <TableCell>
                <Text>
                  {content.replaceAll(/\s+/g, ' ').length <= MAX_EXCERPT_LENGTH
                    ? content.replaceAll(/\s+/g, ' ')
                    : content.split(/\s+/).reduce((acc, cur) => {
                        return acc.length + cur.length <= MAX_EXCERPT_LENGTH
                          ? acc + ' ' + cur
                          : acc;
                      }, '') + '…'}
                </Text>
              </TableCell>
              <TableCell>{storyActions(story)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default StoriesTable;
