import { Button, Card, Icon, Intent, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { NavLink } from 'react-router-dom'

import AssessmentContainer, {
  OwnProps as AssessmentProps
} from '../../containers/AssessmentContainer'
import ContentDisplay, { IContentDisplayProps } from '../commons/ContentDisplay'

export type MissionInfo = {
  id: number
  title: string
  description: string
}

export interface IMissionParams {
  missionId?: string
}

export interface IMissionsProps extends RouteComponentProps<IMissionParams> {
  missionsInfo?: MissionInfo[]
  handleMissionsInfoFetch: () => void
}

export type StateProps = Pick<IMissionsProps, 'missionsInfo'>
export type DispatchProps = Pick<IMissionsProps, 'handleMissionsInfoFetch'>

class Missions extends React.Component<IMissionsProps, {}> {
  public render() {
    // make missionIdParam a number
    let missionIdParam: number | null =
      this.props.match.params.missionId === undefined
        ? NaN
        : parseInt(this.props.match.params.missionId, 10)
    // set as null if the parsing failed
    missionIdParam = Number.isInteger(missionIdParam) ? missionIdParam : null

    // if there is no mission specified, Render only information.
    if (missionIdParam === null) {
      const props: IContentDisplayProps = {
        display: <MissionInfoCard missionsInfo={this.props.missionsInfo} />,
        loadContentDispatch: this.props.handleMissionsInfoFetch
      }
      return (
        <div className="Missions">
          <ContentDisplay {...props} />
        </div>
      )
    } else {
      const props: AssessmentProps = {
        missionId: missionIdParam
      }
      return <AssessmentContainer {...props} />
    }
  }
}

interface IMissionInfoCardProps {
  missionsInfo?: MissionInfo[]
}

export const MissionInfoCard: React.SFC<IMissionInfoCardProps> = props => {
  if (props.missionsInfo === undefined) {
    return <NonIdealState description="Fetching missions..." visual={<Spinner />} />
  } else if (props.missionsInfo.length === 0) {
    return <NonIdealState title="There are no missions." visual={IconNames.FLAME} />
  }
  const cards = props.missionsInfo.map((mission, index) => (
    <div key={index}>
      <Card className="row mission-info">
        <div className="col-xs-3 mission-info-picture">PICTURE</div>
        <div className="col-xs-9 mission-info-text">
          <div className="row mission-info-title">
            <h4>{mission.title}</h4>
          </div>
          <div className="row mission-info-order">
            <h6>Mission 0 : 123123 XP (hardcoded)</h6>
          </div>
          <div className="row mission-info-description">
            <p className="col-xs-12">{mission.description}</p>
          </div>
          <div className="row between-xs middle-xs mission-info-controls">
            <div className="col-xs-8 mission-info-due-date-parent">
              <Text className="mission-info-due-date">
                <Icon className="mission-info-due-icon" iconSize={14} icon={IconNames.TIME} />
                Due: 12/12/12
              </Text>
            </div>
            <div className="col-xs">
              <NavLink to={'/academy/missions/' + mission.id.toString()}>
                <Button
                  className="mission-info-skip-button"
                  minimal={true}
                  intent={Intent.PRIMARY}
                  icon={IconNames.FLAME}
                >
                  Skip Story & Attempt
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </Card>
    </div>
  ))
  return <>{cards}</>
}

export default Missions
