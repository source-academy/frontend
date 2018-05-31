import { Card, Spinner, Text } from '@blueprintjs/core'
import * as React from 'react'

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

class Announcements extends React.Component<IAnnouncementsProps, {}> {
  public componentDidMount() {
    this.props.handleAnnouncementsFetch()
  }

  public render() {
    let output
    if (this.props.announcements === undefined) {
      output = <Spinner />
    } else if (this.props.announcements.length === 0) {
      output = <h4>There are no announcements.</h4>
    } else {
      output = this.props.announcements.map((ann, index) => (
        <div key={index}>
          <AnnouncementCard {...ann} />
        </div>
      ))
    }
    return (
      <div className="Announcements row center-xs">
        <div className="col-xs-10">{output}</div>
      </div>
    )
  }
}

const AnnouncementCard: React.SFC<Announcement> = ann => (
  <Card>
    <h4>{ann.title}</h4>
    <Text>{ann.content}</Text>
  </Card>
)

export default Announcements
