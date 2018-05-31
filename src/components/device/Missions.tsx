import { Card, Spinner, Text } from '@blueprintjs/core'
import * as React from 'react'

export type MissionInfo = {
  title: string
  description: string
}

export interface IMissionsProps {
  missionsInfo?: MissionInfo[]
  handleMissionsInfoFetch: () => void
}

class Missions extends React.Component<IMissionsProps, {}> {
  public componentDidMount() {
    this.props.handleMissionsInfoFetch()
  }

  public render() {
    let output
    if (this.props.missionsInfo === undefined) {
      output = <Spinner />
    } else {
      output = <MissionInfoCard missionsInfo={this.props.missionsInfo} />
    }

    return (
      <div className="Missions row center-xs">
        <div className="col-xs-10">{output}</div>
      </div>
    )
  }
}

interface IMissionInfoCardProps {
  missionsInfo: MissionInfo[]
}

export const MissionInfoCard: React.SFC<IMissionInfoCardProps> = props => {
  if (props.missionsInfo.length === 0) {
    return (
      <>
        <h4>There are no Missions.</h4>
      </>
    )
  } else {
    const cards = props.missionsInfo.map((ann, index) => (
      <div key={index}>
        <Card>
          <h4>{ann.title}</h4>
          <Text>{ann.description}</Text>
        </Card>
      </div>
    ))
    return <>{cards}</>
  }
}

export default Missions
