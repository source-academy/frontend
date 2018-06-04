import { Button, Card, Icon, Intent, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import * as React from 'react'
import ContentDisplay, { IContentDisplayProps } from './ContentDisplay'

export type MissionInfo = {
  title: string
  description: string
}

export interface IMissionsProps {
  missionsInfo?: MissionInfo[]
  handleMissionsInfoFetch: () => void
}

class Missions extends React.Component<IMissionsProps, {}> {
  public render() {
    const props: IContentDisplayProps = {
      display: <MissionInfoCard missionsInfo={this.props.missionsInfo} />,
      loadContentDispatch: this.props.handleMissionsInfoFetch
    }
    return (
      <div className="Missions">
        <ContentDisplay {...props} />
      </div>
    )
  }
}

interface IMissionInfoCardProps {
  missionsInfo?: MissionInfo[]
}

export const MissionInfoCard: React.SFC<IMissionInfoCardProps> = props => {
  if (props.missionsInfo === undefined) {
    return <NonIdealState description="Fetching missions..." visual={<Spinner />} />
  } else if (props.missionsInfo.length === 0) {
    return (
      <>
        <h4>There are no Missions.</h4>
      </>
    )
  }
  const cards = props.missionsInfo.map((ann, index) => (
    <div key={index}>
      <Card className="row mission-info">
        <div className="col-xs-3 mission-info-picture">PICTURE</div>
        <div className="col-xs-9 mission-info-text">
          <div className="row mission-info-title">
            <h4>{ann.title}</h4>
          </div>
          <div className="row mission-info-order">
            <h6>Mission 0 : 123123 XP (hardcoded)</h6>
          </div>
          <div className="row mission-info-description">
            <p className="col-xs-12">{ann.description}</p>
          </div>
          <div className="row between-xs mission-info-controls">
            <div className="col-xs-8 mission-info-due-date-parent">
              <Text className="mission-info-due-date">
                {' '}
                <Icon className="mission-info-due-icon" iconSize={14} icon="time" /> Due: 12/12/12{' '}
              </Text>
            </div>
            <div className="col-xs">
              <Button
                className="mission-info-skip-button"
                minimal={true}
                intent={Intent.PRIMARY}
                icon="flame"
              >
                Skip Story & Attempt
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  ))
  return <>{cards}</>
}

export default Missions
