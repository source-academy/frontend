/**
 * This component is on hold until an endpoint is implemented at
 * source-academy/cadet which is able to download and relay news and material
 * from lumiNUS to us.
 */
import { Card, H4, NonIdealState, Spinner, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import ContentDisplay, { IContentDisplayProps } from './commons/ContentDisplay';

export type Announcement = {
  author: string;
  title: string;
  content: string;
  pinned: boolean;
};

export interface IAnnouncementsProps {
  announcements?: Announcement[];
  handleAnnouncementsFetch: () => void;
}

interface IAnnouncementCardProps {
  announcements?: Announcement[];
}

class Announcements extends React.Component<IAnnouncementsProps, {}> {
  public render() {
    const props: IContentDisplayProps = {
      display: <AnnouncementCard announcements={this.props.announcements} />,
      loadContentDispatch: this.props.handleAnnouncementsFetch
    };
    return <ContentDisplay {...props} />;
  }
}

export const AnnouncementCard: React.SFC<IAnnouncementCardProps> = props => {
  if (props.announcements === undefined) {
    return <NonIdealState description="Fetching announcements..." icon={<Spinner />} />;
  } else if (props.announcements.length === 0) {
    return <NonIdealState title="There are no announcements." icon={IconNames.FEED} />;
  } else {
    const cards = props.announcements.map((ann, index) => (
      <div key={index}>
        <Card>
          <H4>{ann.title}</H4>
          <Text>{ann.content}</Text>
        </Card>
      </div>
    ));
    return <>{cards}</>;
  }
};

export default Announcements;
