import { Card, Text } from '@blueprintjs/core';
import * as React from 'react'

type Announcement = {
  author: string
  title : string
  content : string
  pinned : boolean
  date: Date
}

interface IAnnouncementsProps  {
  announcements: Announcement[]
}

const Announcements: React.SFC<IAnnouncementsProps> = props => {
  const cards = props.announcements.map((ann, index) => 
    <Card
    className="col-xs-8"
    key={index}> 
      <h4>
         {ann.title}
      </h4>
      <Text>
         {ann.content}
      </Text>
      <Text>
         {ann.date.toString()}
      </Text>
    </Card>)
  return (
    <div className="Announcements row center-xs">
      {cards}
    </div>
  )
}
export default Announcements
