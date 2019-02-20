import {
  Button,
  Card,
  Elevation,
  Icon,
  IconName,
  Intent,
  Text,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

import defaultCoverImage from '../../assets/default_cover_image.jpg'
import { getPrettyDate } from '../../utils/dateHelpers'
import { assessmentCategoryLink } from '../../utils/paramParseHelpers'
import {
  IAssessmentOverview
} from '../assessment/assessmentShape'
import { controlButton } from '../commons'
import Markdown from '../commons/Markdown'

const DEFAULT_QUESTION_ID: number = 0

type Props = {
	overview: IAssessmentOverview,
	updateEditingOverview: (overview: IAssessmentOverview) => void
}

interface IState {
	editingOverviewField: string
}


export class EditingOverviewCard extends React.Component<Props, IState> {
	public constructor(props: Props) {
    super(props)
    this.state = {
      editingOverviewField: ''
    }
  }

  public render() {
  	return <div>
  		{this.makeEditingOverviewCard(this.props.overview)}
  	</div>;
  }

  private saveEditOverview = () => {
  	this.setState({
      editingOverviewField: ''
    })
    localStorage.setItem('MissionEditingOverviewSA', JSON.stringify(this.props.overview));
  }

  private handleEditOverview = (field: keyof IAssessmentOverview) => (e: React.ChangeEvent<HTMLInputElement>) =>{
  	const overview = {
  			...this.props.overview,
  		[field]: e.target.value
  	}
    this.props.updateEditingOverview(overview);
  }
  
  private toggleEditField = (field: string) => (e: any) => {
    this.setState({ editingOverviewField: field })
  }

  private makeEditingOverviewCard = (
    overview: IAssessmentOverview
  ) => (
    <div>
      You can edit this card
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className="col-xs-3 listing-picture">
          <img
            className={`cover-image-${overview.status}`}
            src={overview.coverImage ? overview.coverImage : defaultCoverImage}
          />
        </div>
        <div className="col-xs-9 listing-text">
          {this.makeEditingOverviewCardTitle(
            overview,
            overview.title
          )}
          <div className="row listing-grade">
            <h6>
              {' '}
              {`Max Grade: ${overview.maxGrade}`}
              {' '}
            </h6>
          </div>
          <div className="row listing-xp">
            <h6>
              {' '}
              {`Max XP: ${overview.maxXp}`}
              {' '}
            </h6>
          </div>
          <div className="row listing-description" onClick={this.toggleEditField('shortSummary')}>
            {this.state.editingOverviewField === 'shortSummary' ? (
              <input
                type="text"
                onChange={this.handleEditOverview('shortSummary')}
                value={overview.shortSummary}
              />
            ) : (
              <Markdown content={overview.shortSummary} />
            )}
          </div>
          <div className="listing-controls">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              <div className="date-container" onClick={this.toggleEditField("date")}>
                {this.state.editingOverviewField === "date" 
                ? [<input type="text" key="openAt" onChange={this.handleEditOverview("openAt")} value={overview.openAt}/>,
                  <input type="text" key="closeAt" onChange={this.handleEditOverview("closeAt")} value={overview.closeAt}/>]
                : `Opens at: ${getPrettyDate(overview.openAt)} and Due: ${getPrettyDate(overview.closeAt)}`}
              </div>
            </Text>
            {makeOverviewCardButton(overview)}
          </div>
        </div>
      </Card>
    </div>
  )

  private makeEditingOverviewCardTitle = (
  	overview: IAssessmentOverview,
    title: string
  ) => (
    <div className="row listing-title">
      <Text ellipsize={true} className={'col-xs-10'}>
        <h4 onClick={this.toggleEditField("title")}>
          { this.state.editingOverviewField === 'title' 
            ? <input type="text" onChange={this.handleEditOverview('title')} value={title} />
            : title }{' '}
        </h4>
      </Text>
      <div className="col-xs-2">{this.makeSubmissionButton(overview)}</div>
    </div>
  )

  private makeSubmissionButton = (
	  overview: IAssessmentOverview
	) => (
	  <Button
	    // disabled={overview.status !== AssessmentStatuses.attempted}
	    icon={IconNames.CONFIRM}
	    intent={Intent.DANGER}
	    minimal={true}
	    // intentional: each menu renders own version of onClick
	    // tslint:disable-next-line:jsx-no-lambda
	    onClick={() => this.saveEditOverview()}
	  >
	    Save changes
	  </Button>
	)

}

const makeOverviewCardButton = (overview: IAssessmentOverview) => {
  const icon: IconName = IconNames.EDIT;
  const label: string = "Edit mission";
  return (
    <NavLink
      to={`/academy/${assessmentCategoryLink(
        overview.category
      )}/${overview.id.toString()}/${DEFAULT_QUESTION_ID}`}
    >
      {controlButton(label, icon)}
    </NavLink>
  )
}
