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
    const announcements =
      this.props.announcements === undefined ? (
        <Spinner />
      ) : (
        this.props.announcements.map((ann, index) => <AnnouncementCard ann={ann} key={index} />)
      )
    return (
      <div className="Announcements row center-xs">
        <div className="col-xs-10">{announcements}</div>
      </div>
    )
  }
}


const AnnouncementCard: React.SFC<{ann : Announcement, key : number}> = props => (
  <Card key={props.key}>
    <h4>{props.ann.title}</h4>
    <Text>{props.ann.content}</Text>
  </Card>
)


export default Announcements
