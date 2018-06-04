import { Card, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import * as React from 'react'
import ContentDisplay, { IContentDisplayProps } from './ContentDisplay'

export type Announcement = {
  author: string
  title: string
  content: string
  pinned: boolean
}

export interface IAnnouncementsProps {
  announcements?: Announcement[]
  handleAnnouncementsFetch: () => void
}

interface IAnnouncementCardProps {
  announcements?: Announcement[]
}

class Announcements extends React.Component<IAnnouncementsProps, {}> {
  public render() {
    const props: IContentDisplayProps = {
      display: <AnnouncementCard announcements={this.props.announcements} />,
      loadContentDispatch: this.props.handleAnnouncementsFetch
    }
    return <ContentDisplay {...props} />
  }
}

export const AnnouncementCard: React.SFC<IAnnouncementCardProps> = props => {
  if (props.announcements === undefined) {
    return <NonIdealState description="Fetching announcements..." visual={<Spinner />} />
  } else if (props.announcements.length === 0) {
    return <NonIdealState title="There are no announcements." visual="feed" />
  } else {
    const cards = props.announcements.map((ann, index) => (
      <div key={index}>
        <Card>
          <h4>{ann.title}</h4>
          <Text>{ann.content}</Text>
        </Card>
      </div>
    ))
    return <>{cards}</>
  }
}

export default Announcements
