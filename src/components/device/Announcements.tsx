import { Card, Text } from '@blueprintjs/core'
import * as React from 'react'

export type Announcement = {
  author: string
  title: string
  content: string
  pinned: boolean
}

export interface IAnnouncementsProps {
  announcements?: Announcement[]
}

class Announcements extends React.Component<IAnnouncementsProps, {}> {
  public render() {
    const announcements = this.props.announcements === undefined ? [] : this.props.announcements
    // make an API call here if no announcements
    const cards = announcements.map((ann, index) => (
      <Card className="col-xs-8" key={index}>
        <h4>{ann.title}</h4>
        <Text>{ann.content}</Text>
      </Card>
    ))
    return <div className="Announcements row center-xs">{cards}</div>
  }
}
export default Announcements
